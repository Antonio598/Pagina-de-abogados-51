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
import { formatDateTimeLong, SLOT_MINUTES } from "@/lib/booking";
import { db, dbReady, t, type Appointment } from "@/lib/db";
import { filas, layout, sendMail } from "@/lib/mailer";
import { formatMoney } from "@/lib/pricing";
import { stripe, stripeReady } from "@/lib/stripe";
import { process as proceso } from "@content/process";
import { site } from "@content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const areaLabel: Record<string, string> = {
  familiar: "Derecho familiar",
  laboral: "Derecho laboral",
  empresa: "Asesoría para empresas",
  civil: "Derecho civil y contratos",
  otro: "Otro",
};

const correoCliente = (cita: Appointment) =>
  layout(
    "Tu asesoría está confirmada",
    `
    <p style="margin:0 0 16px">Hola ${cita.nombre.split(" ")[0]}: recibimos tu pago y tu asesoría inicial quedó reservada.</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:20px">
      ${filas({
        Folio: cita.folio,
        Fecha: formatDateTimeLong(cita.slot_start),
        Duración: `${SLOT_MINUTES} minutos`,
        Área: areaLabel[cita.area] ?? cita.area,
        Modalidad: cita.modalidad,
        Importe: formatMoney(cita.precio_centavos, cita.moneda),
      })}
    </table>
    <p style="margin:0 0 8px;color:#0D224C;font-weight:600">${proceso.prepare.title}</p>
    <ul style="margin:0 0 20px;padding-left:18px;color:#292A2D">
      ${proceso.prepare.bullets.map((b) => `<li style="margin-bottom:6px">${b}</li>`).join("")}
    </ul>
    <p style="margin:0 0 16px;color:#292A2D">${proceso.note.text}</p>
    <p style="margin:0;color:#292A2D">${site.tagline}</p>`,
  );

const correoInterno = (cita: Appointment) =>
  layout(
    `Cita pagada · ${cita.folio}`,
    `<table style="border-collapse:collapse;width:100%">
      ${filas({
        Folio: cita.folio,
        Origen: cita.origen,
        Fecha: formatDateTimeLong(cita.slot_start),
        Área: areaLabel[cita.area] ?? cita.area,
        Modalidad: cita.modalidad,
        Nombre: cita.nombre,
        Correo: cita.correo,
        Teléfono: cita.telefono,
        Entidad: cita.entidad,
        Municipio: cita.municipio,
        "Fecha próxima": cita.fecha_proxima,
        Descripción: cita.descripcion,
        Importe: formatMoney(cita.precio_centavos, cita.moneda),
        Promoción: cita.promo_aplicada,
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
    sendMail({ to: cita.correo, subject: `Tu asesoría está confirmada · ${cita.folio}`, html: correoCliente(cita) }),
    sendMail({ subject: `[VERITUM] Cita pagada · ${cita.folio}`, html: correoInterno(cita), replyTo: cita.correo }),
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
