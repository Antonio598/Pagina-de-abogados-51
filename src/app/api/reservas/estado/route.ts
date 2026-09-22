// Estado de una reserva por sesión de Stripe. Lo consulta la página de
// confirmación mientras llega el webhook. Devuelve solo lo imprescindible:
// nunca datos personales completos.

import { NextResponse, type NextRequest } from "next/server";
import { formatDateTimeLong } from "@/lib/booking";
import { db, supabaseReady, type Appointment } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !supabaseReady) return NextResponse.json({ ok: false }, { status: 400 });

  const { data, error } = await db()
    .from("appointments")
    .select("folio, status, slot_start, nombre")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("[estado]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!data) return NextResponse.json({ ok: true, encontrada: false });

  const cita = data as Pick<Appointment, "folio" | "status" | "slot_start" | "nombre">;
  return NextResponse.json(
    {
      ok: true,
      encontrada: true,
      status: cita.status,
      folio: cita.folio,
      nombre: cita.nombre.split(" ")[0],
      cuando: formatDateTimeLong(new Date(cita.slot_start)),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
