// Horarios libres. Se consulta desde el formulario de reserva (landing y sitio).
import { NextResponse, type NextRequest } from "next/server";
import { getAvailability, HORIZON_DAYS, TZ, todayISO } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { productoODefecto } from "@content/productos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!dbReady) {
    return NextResponse.json({ ok: false, error: "La agenda no está disponible en este momento." }, { status: 503 });
  }

  const desde = req.nextUrl.searchParams.get("desde");
  const dias = Math.min(Number(req.nextUrl.searchParams.get("dias") ?? HORIZON_DAYS) || HORIZON_DAYS, 60);
  const fromISO = /^\d{4}-\d{2}-\d{2}$/.test(desde ?? "") ? desde! : todayISO();

  // Cada servicio tiene su propia anticipación mínima: el prioritario no ofrece
  // horarios dentro de las próximas 48 h porque hace falta ese tiempo para
  // revisar la documentación antes de la sesión.
  const producto = productoODefecto(req.nextUrl.searchParams.get("producto"));

  try {
    const dias_ = await getAvailability(fromISO, dias, producto.leadMinutos);
    const libres = dias_.reduce((n, d) => n + d.slots.length, 0);
    return NextResponse.json(
      {
        ok: true,
        zona: TZ,
        duracionMinutos: producto.duracionMinutos,
        producto: producto.id,
        leadMinutos: producto.leadMinutos,
        libres,
        dias: dias_,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[disponibilidad]", err);
    return NextResponse.json({ ok: false, error: "No pudimos cargar los horarios." }, { status: 500 });
  }
}
