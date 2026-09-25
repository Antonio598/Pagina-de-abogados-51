// Reserva de horario + creación del cobro en Stripe.
//
// Flujo: validar → comprobar que el horario sigue ofertable PARA ESE SERVICIO →
// reservar de forma atómica en Postgres (retención de 20 min) → crear la
// Checkout Session con el folio dentro → devolver la URL de pago. La cita NO
// queda confirmada aquí: la confirma el webhook cuando Stripe avisa que el pago
// se completó.
//
// El precio lo decide el servidor a partir del id de servicio y del catálogo de
// content/productos.ts. Cualquier importe que mande el navegador se ignora.

import { NextResponse, type NextRequest } from "next/server";
import { HOLD_MINUTES, isSlotOffered, nuevoFolio } from "@/lib/booking";
import { db, dbReady, fn, t, type Appointment } from "@/lib/db";
import { cobroDisponible, precioDe, stripePriceId } from "@/lib/pricing";
import { stripe, stripeReady } from "@/lib/stripe";
import { reservaSchema } from "@/lib/validation";
import { creditoVigenciaDias } from "@content/productos";
import { site } from "@content/site";

/** Todas las asesorías son por videollamada: no se acepta otra modalidad del cliente. */
const MODALIDAD = site.modalidad;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

const rateLimited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
};

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
  }

  if (!dbReady || !stripeReady() || !cobroDisponible()) {
    console.error("[reservas] Falta configuración: base de datos o Stripe.");
    return NextResponse.json(
      { ok: false, error: "La reserva en línea no está disponible en este momento. Escríbenos por los canales de contacto." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  // Honeypot: éxito silencioso para no dar pistas al bot.
  if ((body as { empresa_web?: string })?.empresa_web) {
    return NextResponse.json({ ok: true, url: siteUrl() });
  }

  const parsed = reservaSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return NextResponse.json({ ok: false, error: "Revisa los campos marcados.", fields }, { status: 422 });
  }

  const data = parsed.data;

  // Precio y anticipación: los decide el catálogo, nunca el cliente.
  const precio = precioDe(data.producto);
  const producto = precio.producto;

  // El horario debe seguir siendo ofertable para ESTE servicio: el prioritario
  // exige 48 h de anticipación, así que un horario válido para la asesoría
  // puede no serlo para él.
  if (!(await isSlotOffered(data.slot, producto.leadMinutos))) {
    return NextResponse.json(
      {
        ok: false,
        error:
          producto.leadMinutos > 24 * 60
            ? "Ese horario ya no está disponible para este servicio. Recuerda que se agenda con al menos 48 horas de anticipación."
            : "Ese horario ya no está disponible. Elige otro, por favor.",
        campo: "slot",
      },
      { status: 409 },
    );
  }

  const slotStart = new Date(data.slot);
  const slotEnd = new Date(slotStart.getTime() + producto.duracionMinutos * 60_000);
  const folio = nuevoFolio();

  // Reserva atómica: la función de Postgres expira los holds vencidos e inserta
  // la cita solo si el horario sigue libre.
  const sql = db();
  let cita: Appointment;
  try {
    const [fila] = await sql<Appointment[]>`
      select * from ${sql.unsafe(fn("reservar_slot"))}(
        ${folio}, ${data.origen}, ${slotStart}, ${slotEnd}, ${HOLD_MINUTES},
        ${data.nombre}, ${data.correo}, ${data.telefono}, ${data.asunto},
        ${MODALIDAD}, ${data.entidad || null}, ${data.municipio || null},
        ${data.descripcion || null}, ${data.urgente || null}, ${null},
        ${precio.centavos}, ${precio.moneda}, ${false},
        ${process.env.PRIVACY_NOTICE_VERSION ?? "pendiente"}, ${sql.json(data.utm ?? {})},
        ${producto.id}, ${data.situacion ?? null}, ${creditoVigenciaDias}
      )`;
    if (!fila?.id) {
      return NextResponse.json(
        { ok: false, error: "Ese horario acaba de ocuparse. Elige otro, por favor.", campo: "slot" },
        { status: 409 },
      );
    }
    cita = fila;
  } catch (err) {
    console.error("[reservas] Error al reservar", err);
    return NextResponse.json({ ok: false, error: "No pudimos apartar el horario. Inténtalo de nuevo." }, { status: 500 });
  }

  const volverA = data.origen === "landing" ? "/consulta/agendar" : "/agenda";
  const priceId = stripePriceId(producto);

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "es",
      customer_email: data.correo,
      client_reference_id: cita.folio,
      // La sesión caduca con la retención del horario: si no paga, se libera.
      expires_at: Math.floor(Date.now() / 1000) + Math.max(30, HOLD_MINUTES) * 60,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: precio.moneda.toLowerCase(),
                unit_amount: precio.centavos,
                product_data: {
                  name: `${producto.nombre} · VERITUM`,
                  description: `Sesión de hasta ${producto.duracionMinutos} minutos. Folio ${cita.folio}.`,
                },
              },
            },
      ],
      metadata: {
        appointment_id: cita.id,
        folio: cita.folio,
        origen: cita.origen,
        producto: producto.id,
        situacion: data.situacion ?? "",
        slot_start: cita.slot_start.toISOString(),
      },
      payment_intent_data: {
        metadata: { appointment_id: cita.id, folio: cita.folio, producto: producto.id },
      },
      success_url: `${siteUrl()}/consulta/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}${volverA}?pago=cancelado&folio=${cita.folio}`,
    });

    await sql`update ${t("appointments")} set stripe_session_id = ${session.id} where id = ${cita.id}`;

    return NextResponse.json({ ok: true, url: session.url, folio: cita.folio });
  } catch (err) {
    console.error("[reservas] Error al crear la sesión de pago", err);
    // Liberamos el horario: no tiene sentido retenerlo si no hay cobro.
    await sql`update ${t("appointments")} set status = 'cancelada' where id = ${cita.id}`;
    return NextResponse.json({ ok: false, error: "No pudimos iniciar el pago. Inténtalo de nuevo." }, { status: 502 });
  }
}
