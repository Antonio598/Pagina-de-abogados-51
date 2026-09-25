// Entrada de contactos desde n8n.
//
// POST: n8n avisa que habló con una persona. Se guarda la hora y, al terminar de
// responder, se dispara un barrido de recordatorios por si el nodo Schedule no
// estuviera configurado.
//
// GET: consulta del estado de un teléfono (¿ya se le mandó el recordatorio 2?),
// útil para decidir el mensaje en n8n y para depurar sin entrar a la base.
//
// Ambos exigen la cabecera `Authorization: Bearer <SEGUIMIENTO_API_TOKEN>`.

import { NextResponse, after, type NextRequest } from "next/server";
import { z } from "zod";
import { dbReady } from "@/lib/db";
import {
  barrerEnSegundoPlano,
  normalizarTelefono,
  obtenerContacto,
  registrarContacto,
  tokenConfigurado,
  tokenValido,
} from "@/lib/seguimiento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 120;
const hits = new Map<string, number[]>();

const rateLimited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
};

const ipDe = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";

// Se aceptan alias porque n8n suele arrastrar el nombre del campo de origen.
const telefonoCampo = z.string().trim().min(8).max(25);
// Se exige desfase horario para no adivinar zonas: en n8n, {{ $now.toISO() }}.
const fechaCampo = z.string().trim().datetime({ offset: true });

const schema = z
  .object({
    telefono: telefonoCampo.optional(),
    numero: telefonoCampo.optional(),
    phone: telefonoCampo.optional(),
    // Opcional: si no llega, se usa la hora del servidor.
    ultima_hora_contacto: fechaCampo.optional(),
    ultimo_contacto: fechaCampo.optional(),
    datos: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((v) => Boolean(v.telefono || v.numero || v.phone), {
    message: "Falta el teléfono.",
    path: ["telefono"],
  });

const noConfigurado = () =>
  NextResponse.json(
    { ok: false, error: "El seguimiento no está configurado: faltan DATABASE_URL o SEGUIMIENTO_API_TOKEN." },
    { status: 503 },
  );

const noAutorizado = () => NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });

/** Lo que se devuelve de un contacto: sin datos internos de más. */
const publico = (c: {
  telefono: string;
  telefono_normalizado: string;
  ultimo_contacto: Date;
  recordatorios_resueltos: number;
  recordatorio_1_at: Date | null;
  recordatorio_2_at: Date | null;
  recordatorio_3_at: Date | null;
  contactos_recibidos: number;
}) => ({
  telefono: c.telefono,
  telefono_normalizado: c.telefono_normalizado,
  ultimo_contacto: c.ultimo_contacto.toISOString(),
  recordatorios_resueltos: c.recordatorios_resueltos,
  recordatorio_1_at: c.recordatorio_1_at?.toISOString() ?? null,
  recordatorio_2_at: c.recordatorio_2_at?.toISOString() ?? null,
  recordatorio_3_at: c.recordatorio_3_at?.toISOString() ?? null,
  contactos_recibidos: c.contactos_recibidos,
});

export async function POST(req: NextRequest) {
  if (!dbReady || !tokenConfigurado()) return noConfigurado();
  if (!tokenValido(req.headers.get("authorization"))) return noAutorizado();
  if (rateLimited(ipDe(req))) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida: el cuerpo no es JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return NextResponse.json({ ok: false, error: "Revisa los campos enviados.", fields }, { status: 422 });
  }

  const d = parsed.data;
  const telefono = (d.telefono ?? d.numero ?? d.phone)!;
  if (!normalizarTelefono(telefono)) {
    return NextResponse.json(
      { ok: false, error: "El teléfono no es válido: hacen falta al menos 10 dígitos.", fields: { telefono: "Teléfono no válido." } },
      { status: 422 },
    );
  }

  const fecha = d.ultima_hora_contacto ?? d.ultimo_contacto;

  let contacto;
  try {
    contacto = await registrarContacto({
      telefono,
      ultimoContacto: fecha ? new Date(fecha) : null,
      datos: d.datos,
    });
  } catch (err) {
    console.error("[seguimientos] Error al registrar el contacto", err);
    return NextResponse.json({ ok: false, error: "No pudimos guardar el contacto." }, { status: 500 });
  }

  if (!contacto) {
    return NextResponse.json({ ok: false, error: "El teléfono no es válido." }, { status: 422 });
  }

  // Después de responder: no retrasa a n8n y el runtime no lo corta a medias,
  // como sí haría con una promesa suelta.
  after(() => barrerEnSegundoPlano());

  return NextResponse.json({ ok: true, contacto: publico(contacto) });
}

export async function GET(req: NextRequest) {
  if (!dbReady || !tokenConfigurado()) return noConfigurado();
  if (!tokenValido(req.headers.get("authorization"))) return noAutorizado();
  if (rateLimited(ipDe(req))) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  const telefono = req.nextUrl.searchParams.get("telefono")?.trim();
  if (!telefono || !normalizarTelefono(telefono)) {
    return NextResponse.json({ ok: false, error: "Indica un teléfono válido en ?telefono=" }, { status: 422 });
  }

  try {
    const reg = await obtenerContacto(telefono);
    if (!reg) return NextResponse.json({ ok: false, error: "Sin registro de ese teléfono." }, { status: 404 });
    return NextResponse.json({
      ok: true,
      contacto: publico(reg.contacto),
      recordatorios: reg.recordatorios.map((r) => ({
        numero: r.numero,
        estado: r.estado,
        intentos: r.intentos,
        http_status: r.http_status,
        error: r.error,
        enviado_at: r.enviado_at?.toISOString() ?? null,
        creado_at: r.created_at.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[seguimientos] Error al consultar el contacto", err);
    return NextResponse.json({ ok: false, error: "No pudimos consultar el contacto." }, { status: 500 });
  }
}
