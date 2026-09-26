import "server-only";
import nodemailer from "nodemailer";

// Envío de correo compartido por el formulario de contacto y por las citas.
//
// Dos transportes, en este orden:
//   1. RESEND (preferido): API HTTPS, no hace falta servidor SMTP ni puertos
//      abiertos, y admite una clave de idempotencia para que un reintento no
//      mande el mismo correo dos veces.
//   2. SMTP con nodemailer, como respaldo si no hay clave de Resend.
//
// Sin ninguno de los dos configurado no se simula nada: se registra el fallo y
// quien llama decide qué responder.

const RESEND_URL = "https://api.resend.com/emails";
/** Tiempo límite de la llamada a Resend: un correo no puede colgar la petición. */
const TIMEOUT_MS = 10_000;

const resendKey = () => process.env.RESEND_API_KEY?.trim() || undefined;

/** Remitente. En Resend debe pertenecer a un dominio verificado en la cuenta. */
const remitente = () =>
  process.env.RESEND_FROM?.trim() ||
  process.env.SMTP_FROM?.trim() ||
  process.env.SMTP_USER?.trim() ||
  process.env.CONTACT_TO_EMAIL?.trim();

/** Destinatario interno de VERITUM cuando no se indica uno. */
const destinoInterno = () => process.env.CONTACT_TO_EMAIL?.trim();

export const resendReady = () => Boolean(resendKey() && remitente());
export const smtpReady = () => Boolean(process.env.SMTP_HOST && destinoInterno());

/** Hay algún transporte de correo utilizable. */
export const mailReady = () => resendReady() || smtpReady();

/** Nombre del transporte que se usaría, para los registros y el panel. */
export const mailTransporte = () => (resendReady() ? "resend" : smtpReady() ? "smtp" : "ninguno");

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export type MailOpts = {
  to?: string;
  subject: string;
  html: string;
  replyTo?: string;
  /**
   * Clave de idempotencia. Resend la respeta durante 24 h: con ella, un
   * reintento del webhook de Stripe no puede mandar dos veces el mismo correo
   * de confirmación al cliente.
   */
  idempotencyKey?: string;
};

const porResend = async (opts: MailOpts, from: string, to: string): Promise<boolean> => {
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      headers: {
        authorization: `Bearer ${resendKey()}`,
        "content-type": "application/json",
        ...(opts.idempotencyKey ? { "idempotency-key": opts.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        html: opts.html,
        // El campo de la API va en snake_case; no es replyTo.
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      // El cuerpo del error de Resend dice exactamente qué falta (dominio sin
      // verificar, remitente no permitido, clave inválida): se registra entero
      // porque es la única pista útil cuando un correo no llega.
      const detalle = (await res.text().catch(() => "")).slice(0, 500);
      console.error(`[mailer] Resend rechazó el envío (HTTP ${res.status})`, detalle);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mailer] Error al llamar a Resend", err);
    return false;
  }
};

const porSmtp = async (opts: MailOpts, from: string, to: string): Promise<boolean> => {
  try {
    await transporter().sendMail({ from, to, replyTo: opts.replyTo, subject: opts.subject, html: opts.html });
    return true;
  } catch (err) {
    console.error("[mailer] Error al enviar por SMTP", err);
    return false;
  }
};

/** Nunca lanza: devuelve si se envió y quien llama decide qué hacer. */
export const sendMail = async (opts: MailOpts): Promise<boolean> => {
  const to = opts.to ?? destinoInterno();
  const from = remitente();

  if (!to) {
    console.error("[mailer] Sin destinatario: define CONTACT_TO_EMAIL.");
    return false;
  }
  if (!from) {
    console.error("[mailer] Sin remitente: define RESEND_FROM (o SMTP_FROM).");
    return false;
  }

  if (resendReady()) return porResend(opts, from, to);
  if (smtpReady()) return porSmtp(opts, from, to);

  console.error("[mailer] Sin transporte de correo: define RESEND_API_KEY y RESEND_FROM, o SMTP_HOST.");
  return false;
};

/** Envoltorio con la identidad de VERITUM para los correos transaccionales. */
export const layout = (titulo: string, cuerpo: string) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;color:#292A2D;background:#F7F4ED;padding:24px">
    <div style="background:#0D224C;padding:20px 24px;border-radius:6px 6px 0 0">
      <p style="margin:0;color:#FFFFFF;font-size:20px;letter-spacing:6px;font-family:Georgia,serif">VERITUM</p>
      <p style="margin:6px 0 0;color:#CA9E32;font-size:10px;letter-spacing:3px">CAPITAL HUMANO &amp; LEGAL</p>
    </div>
    <div style="background:#FFFFFF;padding:24px;border:1px solid #E5E1D8;border-top:0;border-radius:0 0 6px 6px">
      <h1 style="margin:0 0 16px;color:#0D224C;font-size:20px;font-family:Georgia,serif">${esc(titulo)}</h1>
      ${cuerpo}
      <hr style="border:0;border-top:1px solid #E5E1D8;margin:24px 0">
      <p style="font-size:12px;color:#6b6b6b;margin:0">
        La información de este sitio es general y no constituye asesoría legal. Cada asunto requiere valoración individual.
      </p>
    </div>
  </div>`;

export const filas = (data: Record<string, unknown>) =>
  Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#7A653A;text-transform:uppercase;font-size:11px;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#292A2D">${esc(v === true ? "Sí" : v)}</td></tr>`,
    )
    .join("");
