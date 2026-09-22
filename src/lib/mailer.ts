import "server-only";
import nodemailer from "nodemailer";

// Envío de correo compartido por el formulario de contacto y por las citas.
// Sin SMTP configurado no se simula nada: se registra el fallo y quien llama
// decide qué responder.

export const smtpReady = () => Boolean(process.env.SMTP_HOST && process.env.CONTACT_TO_EMAIL);

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

export const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export const sendMail = async (opts: { to?: string; subject: string; html: string; replyTo?: string }) => {
  if (!smtpReady()) {
    console.error("[mailer] SMTP no configurado: define SMTP_HOST y CONTACT_TO_EMAIL.");
    return false;
  }
  try {
    await transporter().sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? process.env.CONTACT_TO_EMAIL,
      to: opts.to ?? process.env.CONTACT_TO_EMAIL,
      replyTo: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Error al enviar correo", err);
    return false;
  }
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
