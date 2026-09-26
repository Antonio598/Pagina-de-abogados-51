// Webhook de Stripe: el pago es lo que confirma la cita.
//
// - Verifica la firma con el cuerpo crudo.
// - Es idempotente: cada evento se registra en `stripe_events` y no se procesa
//   dos veces (un reintento de Stripe no duplica citas ni correos).
// - Al confirmar, envía correo al cliente y a VERITUM.
//
// URL en producción: https://<dominio>/api/stripe/webhook

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { formatDateOnly, formatDateTimeLong, SLOT_MINUTES } from "@/lib/booking";
import { db, dbReady, t, type Appointment } from "@/lib/db";
import { filas, layout, sendMail } from "@/lib/mailer";
import { formatMoney } from "@/lib/pricing";
import { stripe, stripeReady } from "@/lib/stripe";
import { process as proceso } from "@content/process";
import { site } from "@content/site";
import { creditoRepresentacion, productoPorId, situacionLabel } from "@content/productos";
import { checklistDe } from "@content/portal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const areaLabel: Record<string, string> = {
  familiar: "Derecho familiar",
  laboral: "Derecho laboral",
  empresa: "Asesoría para empresas",
  civil: "Derecho civil y contratos",
  otro: "Otro",
};

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://veritum.com.mx").replace(/\/$/, "");

const enlaceDe = (cita: Appointment) => cita.enlace_sesion ?? process.env.MEETING_URL?.trim() ?? null;

const fecha = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Mexico_City" }).format(d) : null;

const correoCliente = (cita: Appointment) => {
  const producto = productoPorId(cita.producto_id);
  const enlace = enlaceDe(cita);
  const checklist = checklistDe(cita.situacion);
  const portalUrl = `${siteUrl()}/portal`;

  // Si la cita trae situación, el checklist de su situación es más útil que la
  // lista genérica de "qué preparar" del sitio.
  const preparar = cita.situacion
    ? { titulo: checklist.titulo, items: [...checklist.necesario] }
    : { titulo: proceso.prepare.title, items: [...proceso.prepare.bullets] };

  return layout(
    "Tu asesoría está confirmada",
    `
    <p style="margin:0 0 16px">Hola ${cita.nombre.split(" ")[0]}: recibimos tu pago y tu sesión quedó reservada.</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
      ${filas({
        Folio: cita.folio,
        Servicio: producto?.nombre ?? areaLabel[cita.area] ?? cita.area,
        Situación: situacionLabel(cita.situacion),
        Fecha: formatDateTimeLong(cita.slot_start),
        Duración: `hasta ${producto?.duracionMinutos ?? SLOT_MINUTES} minutos`,
        Modalidad: cita.modalidad,
        Importe: formatMoney(cita.precio_centavos, cita.moneda),
      })}
    </table>

    <p style="margin:0 0 8px;color:#0D224C;font-weight:600">Tu videollamada</p>
    <p style="margin:0 0 20px;color:#292A2D">${
      enlace
        ? `Entra a esta dirección a la hora de tu sesión:<br><a href="${enlace}" style="color:#0D224C">${enlace}</a>`
        : "Te enviaremos el enlace de la videollamada por correo antes de tu sesión."
    }</p>

    <p style="margin:0 0 8px;color:#0D224C;font-weight:600">Sube tu documentación</p>
    <p style="margin:0 0 12px;color:#292A2D">
      Entra a <a href="${portalUrl}" style="color:#0D224C">${portalUrl}</a> con tu teléfono y el folio
      <strong>${cita.folio}</strong>, y carga lo que tengas de tu asunto.${
        producto?.requiereDocumentos
          ? " Para la revisión prioritaria necesitamos tu documentación antes de la sesión: revisaremos lo que cargues y te confirmaremos por escrito el alcance delimitado de la revisión."
          : ""
      }
    </p>
    <p style="margin:0 0 8px;color:#0D224C;font-weight:600">${preparar.titulo}</p>
    <ul style="margin:0 0 20px;padding-left:18px;color:#292A2D">
      ${preparar.items.map((b) => `<li style="margin-bottom:6px">${b}</li>`).join("")}
    </ul>

    <div style="border-left:3px solid #CA9E32;padding:12px 16px;background:#F7F4ED;margin-bottom:20px">
      <p style="margin:0 0 6px;color:#0D224C;font-weight:600">${creditoRepresentacion.titulo}</p>
      <p style="margin:0 0 8px;color:#292A2D">${creditoRepresentacion.texto}</p>
      <p style="margin:0;color:#292A2D">
        Importe a descontar: <strong>${formatMoney(cita.precio_centavos, cita.moneda)}</strong>${
          fecha(cita.credito_vence_at) ? ` · vigente hasta el ${fecha(cita.credito_vence_at)}` : ""
        }
      </p>
    </div>

    <p style="margin:0 0 16px;color:#292A2D">${proceso.note.text}</p>
    <p style="margin:0;color:#292A2D">${site.tagline}</p>`,
  );
};

const correoInterno = (cita: Appointment) =>
  layout(
    `Cita pagada · ${cita.folio}`,
    `<table style="border-collapse:collapse;width:100%">
      ${filas({
        Folio: cita.folio,
        Origen: cita.origen,
        Servicio: productoPorId(cita.producto_id)?.nombre,
        Situación: situacionLabel(cita.situacion),
        Fecha: formatDateTimeLong(cita.slot_start),
        Área: areaLabel[cita.area] ?? cita.area,
        Modalidad: cita.modalidad,
        Nombre: cita.nombre,
        Correo: cita.correo,
        Teléfono: cita.telefono,
        Entidad: cita.entidad,
        Municipio: cita.municipio,
        "Fecha próxima": cita.fecha_proxima ? formatDateOnly(cita.fecha_proxima) : null,
        Descripción: cita.descripcion,
        Importe: formatMoney(cita.precio_centavos, cita.moneda),
        "Crédito vigente hasta": fecha(cita.credito_vence_at),
        "Enlace de sesión": enlaceDe(cita) ?? "SIN DEFINIR",
        "Pago (Stripe)": cita.stripe_payment_intent,
      })}
    </table>`,
  );

const confirmar = async (session: Stripe.Checkout.Session) => {
  const appointmentId = session.metadata?.appointment_id;
  if (!appointmentId) {
    console.error("[webhook] Sesión sin appointment_id", session.id);
    return;
  }

  const sql = db();
  const intent = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const [cita] = await sql<Appointment[]>`
    update ${t("appointments")}
       set status = 'pagada',
           paid_at = now(),
           hold_expires_at = null,
           stripe_session_id = ${session.id},
           stripe_payment_intent = ${intent},
           precio_centavos = coalesce(${session.amount_total ?? null}::int, precio_centavos)
     where id = ${appointmentId} and status <> 'pagada'
     returning *`;

  if (!cita) return; // ya estaba pagada: nada que hacer
  await Promise.all([
    // La clave de idempotencia la respeta Resend 24 h: aunque Stripe reintente
    // el evento y se colara una carrera, el cliente no recibe dos confirmaciones.
    sendMail({
      to: cita.correo,
      subject: `Tu asesoría está confirmada · ${cita.folio}`,
      html: correoCliente(cita),
      idempotencyKey: `cita-cliente-${cita.folio}`,
    }),
    sendMail({
      subject: `[VERITUM] Cita pagada · ${cita.folio}`,
      html: correoInterno(cita),
      replyTo: cita.correo,
      idempotencyKey: `cita-interno-${cita.folio}`,
    }),
  ]);
  console.info("[webhook] Cita confirmada", { folio: cita.folio, slot: cita.slot_start });
};

const liberar = async (session: Stripe.Checkout.Session) => {
  const appointmentId = session.metadata?.appointment_id;
  if (!appointmentId) return;
  await db()`
    update ${t("appointments")} set status = 'expirada'
     where id = ${appointmentId} and status = 'pendiente_pago'`;
};

export async function POST(req: NextRequest) {
  if (!stripeReady() || !dbReady || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] Falta STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET o DATABASE_URL.");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const firma = req.headers.get("stripe-signature");
  if (!firma) return NextResponse.json({ ok: false, error: "Sin firma." }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, firma, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Firma inválida", err);
    return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 400 });
  }

  // Idempotencia: si el id ya está registrado, Stripe está reintentando.
  try {
    const filas = await db()`
      insert into ${t("stripe_events")} (id, tipo) values (${event.id}, ${event.type})
      on conflict (id) do nothing
      returning id`;
    if (filas.length === 0) return NextResponse.json({ ok: true, repetido: true });
  } catch (err) {
    console.error("[webhook] No se pudo registrar el evento", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.payment_status === "paid") await confirmar(session);
        break;
      }
      case "checkout.session.async_payment_succeeded":
        await confirmar(event.data.object);
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await liberar(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] Error al procesar", event.type, err);
    // Se borra el registro para que el reintento de Stripe pueda volver a entrar.
    await db()`delete from ${t("stripe_events")} where id = ${event.id}`;
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
