// Recepción de formularios (contacto y agenda). Bloque 6.
// - Validación en servidor con los mismos esquemas del cliente.
// - Honeypot y límite de tasa por IP en memoria (suficiente para un solo contenedor).
// - Envío por SMTP con nodemailer al correo autorizado de VERITUM.
// - Registro del consentimiento (fecha/hora, versión de aviso, IP con hash).
// - Sin SMTP configurado responde 503: nunca simula un envío exitoso.
// Los datos nunca se envían a plataformas de analítica ni de publicidad.

import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { agendaSchema, contactSchema } from "@/lib/validation";

export const runtime = "nodejs";

const PRIVACY_VERSION = process.env.PRIVACY_NOTICE_VERSION ?? "pendiente";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const rateLimited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
};

const smtpReady = () => Boolean(process.env.SMTP_HOST && process.env.CONTACT_TO_EMAIL);

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

const rows = (data: Record<string, unknown>) =>
  Object.entries(data)
    .filter(([k, v]) => v !== undefined && v !== "" && k !== "empresa_web")
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#7A653A;text-transform:uppercase;font-size:12px;letter-spacing:.08em;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#292A2D">${esc(v === true ? "Sí" : v)}</td></tr>`)
    .join("");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  // Honeypot lleno: respondemos como éxito silencioso para no dar pistas al bot.
  if ((body as { empresa_web?: string })?.empresa_web) {
    return NextResponse.json({ ok: true, id: "ignored" });
  }

  const tipo = (body as { tipo?: string })?.tipo === "agenda" ? "agenda" : "contacto";
  const parsed = tipo === "agenda" ? agendaSchema.safeParse(body) : contactSchema.safeParse(body);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json({ ok: false, error: "Revisa los campos marcados.", fields }, { status: 422 });
  }

  if (!smtpReady()) {
    console.error("[contacto] SMTP no configurado: define SMTP_HOST y CONTACT_TO_EMAIL.");
    return NextResponse.json(
      { ok: false, error: "El envío no está disponible en este momento. Utiliza un canal de contacto directo." },
      { status: 503 },
    );
  }

  const data = parsed.data as Record<string, unknown>;
  const id = createHash("sha256").update(`${Date.now()}:${ip}:${String(data.correo)}`).digest("hex").slice(0, 12);
  const consent = {
    version_aviso: PRIVACY_VERSION,
    fecha_hora: new Date().toISOString(),
    ip_hash: createHash("sha256").update(ip).digest("hex").slice(0, 16),
    user_agent: req.headers.get("user-agent") ?? "",
  };

  const subject = tipo === "agenda" ? `[VERITUM] Solicitud de reserva · ${data.asunto} · ${id}` : `[VERITUM] Nueva solicitud de contacto · ${data.asunto} · ${id}`;

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#292A2D">
      <p style="color:#0D224C;font-size:18px;margin:0 0 4px"><strong>VERITUM</strong> · ${tipo === "agenda" ? "Solicitud de reserva" : "Solicitud de contacto"}</p>
      <p style="color:#7A653A;font-size:12px;margin:0 0 16px">Folio ${id}</p>
      <table style="border-collapse:collapse;width:100%">${rows(data)}</table>
      <hr style="border:0;border-top:1px solid #E5E1D8;margin:20px 0">
      <p style="color:#7A653A;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px">Registro de consentimiento</p>
      <table style="border-collapse:collapse;width:100%">${rows(consent)}</table>
      <p style="font-size:12px;color:#777;margin-top:20px">Este correo contiene datos personales: trátalo conforme al aviso de privacidad y a la política de retención de VERITUM.</p>
    </div>`;

  try {
    await transporter().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? process.env.CONTACT_TO_EMAIL,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: String(data.correo),
      subject,
      html,
    });
  } catch (err) {
    console.error("[contacto] Error al enviar correo", { id, err });
    return NextResponse.json({ ok: false, error: "No pudimos enviar tu solicitud. Inténtalo de nuevo." }, { status: 502 });
  }

  console.info("[contacto] Solicitud enviada", { id, tipo, asunto: data.asunto, consent: consent.fecha_hora });
  return NextResponse.json({ ok: true, id });
}
