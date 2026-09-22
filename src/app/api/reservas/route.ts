// Reserva de horario + creación del cobro en Stripe.
//
// Flujo: validar → comprobar que el horario sigue ofertable → reservar de forma
// atómica en Postgres (retención de 20 min) → crear la Checkout Session con el
// folio dentro → devolver la URL de pago. La cita NO queda confirmada aquí:
// la confirma el webhook cuando Stripe avisa que el pago se completó.
//
// El precio lo decide el servidor a partir de la cookie firmada de promoción;
// cualquier importe que mande el navegador se ignora.

import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { HOLD_MINUTES, SLOT_MINUTES, isSlotOffered, nuevoFolio } from "@/lib/booking";
import { db, supabaseReady, type Appointment } from "@/lib/db";
import { cobroConfigurado, precioVigente, stripePriceId } from "@/lib/pricing";
import { PROMO_COOKIE, promoStateFrom, readPromo } from "@/lib/promo";
import { promoConfigurada } from "@/lib/pricing";
import { stripe, stripeReady } from "@/lib/stripe";
import { reservaSchema } from "@/lib/validation";

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

  if (!supabaseReady || !stripeReady() || !cobroConfigurado) {
    console.error("[reservas] Falta configuración: Supabase, Stripe o el precio de la asesoría.");
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

  // El horario debe seguir siendo ofertable (no pasado, no bloqueado, no ocupado).
  if (!(await isSlotOffered(data.slot))) {
    return NextResponse.json(
      { ok: false, error: "Ese horario ya no está disponible. Elige otro, por favor.", campo: "slot" },
      { status: 409 },
    );
  }

  // Precio: decidido aquí, nunca por el cliente.
  const promoStart = await readPromo((await cookies()).get(PROMO_COOKIE)?.value);
  const promo = promoStateFrom(promoStart, promoConfigurada);
  const precio = precioVigente(promo.active);
  const priceId = stripePriceId(precio.conDescuento);

  const slotStart = new Date(data.slot);
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000);
  const folio = nuevoFolio();

  const { data: reserva, error } = await db().rpc("reservar_slot", {
    p_folio: folio,
    p_origen: data.origen,
    p_slot_start: slotStart.toISOString(),
    p_slot_end: slotEnd.toISOString(),
    p_hold_minutos: HOLD_MINUTES,
    p_nombre: data.nombre,
    p_correo: data.correo,
    p_telefono: data.telefono,
    p_area: data.asunto,
    p_modalidad: data.modalidad || null,
    p_entidad: data.entidad || null,
    p_municipio: data.municipio || null,
    p_descripcion: data.descripcion || null,
    p_fecha_proxima: data.urgente || null,
    p_canal: null,
    p_precio_centavos: precio.centavos,
    p_moneda: precio.moneda,
    p_promo_aplicada: precio.conDescuento,
    p_aviso_version: process.env.PRIVACY_NOTICE_VERSION ?? "pendiente",
    p_utm: data.utm ?? {},
  });

  if (error) {
    console.error("[reservas] Error al reservar", error);
    return NextResponse.json({ ok: false, error: "No pudimos apartar el horario. Inténtalo de nuevo." }, { status: 500 });
  }
  if (!reserva) {
    return NextResponse.json(
      { ok: false, error: "Ese horario acaba de ocuparse. Elige otro, por favor.", campo: "slot" },
      { status: 409 },
    );
  }

  const cita = reserva as Appointment;
  const volverA = data.origen === "landing" ? "/consulta/agendar" : "/agenda";

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
                  name: "Asesoría legal inicial · VERITUM",
                  description: `Sesión de ${SLOT_MINUTES} minutos. Folio ${cita.folio}.`,
                },
              },
            },
      ],
      metadata: {
        appointment_id: cita.id,
        folio: cita.folio,
        origen: cita.origen,
        slot_start: cita.slot_start,
        promo: String(precio.conDescuento),
      },
      payment_intent_data: {
        metadata: { appointment_id: cita.id, folio: cita.folio },
      },
      success_url: `${siteUrl()}/consulta/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}${volverA}?pago=cancelado&folio=${cita.folio}`,
    });

    await db().from("appointments").update({ stripe_session_id: session.id }).eq("id", cita.id);

    return NextResponse.json({ ok: true, url: session.url, folio: cita.folio });
  } catch (err) {
    console.error("[reservas] Error al crear la sesión de pago", err);
    // Liberamos el horario: no tiene sentido retenerlo si no hay cobro.
    await db().from("appointments").update({ status: "cancelada" }).eq("id", cita.id);
    return NextResponse.json({ ok: false, error: "No pudimos iniciar el pago. Inténtalo de nuevo." }, { status: 502 });
  }
}
