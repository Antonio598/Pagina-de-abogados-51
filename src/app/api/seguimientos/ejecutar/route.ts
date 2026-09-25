// Barrido de recordatorios.
//
// Lo llama el nodo Schedule de n8n cada 5 minutos. La aplicación no tiene reloj
// propio: quién está vencido lo decide la base de datos comparando contra now(),
// así que basta con que alguien llame a esta ruta con regularidad.
//
// Se acepta GET además de POST porque muchos programadores de tareas solo hacen
// GET. Exige `Authorization: Bearer <SEGUIMIENTO_API_TOKEN>`.

import { NextResponse, type NextRequest } from "next/server";
import { dbReady } from "@/lib/db";
import { barrer, barridoEnCurso, tokenConfigurado, tokenValido, webhookUrl } from "@/lib/seguimiento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

const rateLimited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
};

const ejecutar = async (req: NextRequest) => {
  if (!dbReady || !tokenConfigurado()) {
    return NextResponse.json(
      { ok: false, error: "El seguimiento no está configurado: faltan DATABASE_URL o SEGUIMIENTO_API_TOKEN." },
      { status: 503 },
    );
  }
  if (!tokenValido(req.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  if (!webhookUrl()) {
    return NextResponse.json(
      { ok: false, error: "Falta SEGUIMIENTO_WEBHOOK_URL: no se manda ningún recordatorio." },
      { status: 503 },
    );
  }

  // Ya hay uno corriendo en este proceso: no se encola, se avisa.
  if (barridoEnCurso()) return NextResponse.json({ ok: true, enCurso: true });

  const crudo = req.nextUrl.searchParams.get("limite");
  const limite = crudo && Number.isFinite(Number(crudo)) ? Number(crudo) : undefined;

  try {
    const resumen = await barrer({ limite });
    return NextResponse.json({ ok: true, ...resumen });
  } catch (err) {
    console.error("[seguimientos] Error en el barrido", err);
    return NextResponse.json({ ok: false, error: "El barrido falló." }, { status: 500 });
  }
};

export const POST = ejecutar;
export const GET = ejecutar;
