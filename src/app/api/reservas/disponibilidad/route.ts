// Horarios libres. Se consulta desde el formulario de reserva (landing y sitio).
import { NextResponse, type NextRequest } from "next/server";
import { getAvailability, HORIZON_DAYS, SLOT_MINUTES, TZ, todayISO } from "@/lib/booking";
import { supabaseReady } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!supabaseReady) {
    return NextResponse.json({ ok: false, error: "La agenda no está disponible en este momento." }, { status: 503 });
  }

  const desde = req.nextUrl.searchParams.get("desde");
  const dias = Math.min(Number(req.nextUrl.searchParams.get("dias") ?? HORIZON_DAYS) || HORIZON_DAYS, 60);
  const fromISO = /^\d{4}-\d{2}-\d{2}$/.test(desde ?? "") ? desde! : todayISO();

  try {
    const dias_ = await getAvailability(fromISO, dias);
    return NextResponse.json(
      { ok: true, zona: TZ, duracionMinutos: SLOT_MINUTES, dias: dias_ },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[disponibilidad]", err);
    return NextResponse.json({ ok: false, error: "No pudimos cargar los horarios." }, { status: 500 });
  }
}
