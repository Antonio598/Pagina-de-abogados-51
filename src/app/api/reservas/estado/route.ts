// Estado de una reserva por sesión de Stripe. Lo consulta la página de
// confirmación mientras llega el webhook. Devuelve solo lo imprescindible:
// nunca datos personales completos.

import { NextResponse, type NextRequest } from "next/server";
import { formatDateTimeLong } from "@/lib/booking";
import { db, dbReady, t, type Appointment } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !dbReady) return NextResponse.json({ ok: false }, { status: 400 });

  type Fila = Pick<Appointment, "folio" | "status" | "slot_start" | "nombre">;
  let cita: Fila | undefined;
  try {
    const sql = db();
    [cita] = await sql<Fila[]>`
      select folio, status, slot_start, nombre
        from ${t("appointments")}
       where stripe_session_id = ${sessionId}
       limit 1`;
  } catch (err) {
    console.error("[estado]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  if (!cita) return NextResponse.json({ ok: true, encontrada: false });
  return NextResponse.json(
    {
      ok: true,
      encontrada: true,
      status: cita.status,
      folio: cita.folio,
      nombre: cita.nombre.split(" ")[0],
      cuando: formatDateTimeLong(cita.slot_start),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
