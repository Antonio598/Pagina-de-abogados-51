// Exportación de citas pagadas en CSV. Requiere sesión del panel.
import { NextResponse, type NextRequest } from "next/server";
import { formatDateTimeLong } from "@/lib/booking";
import { db, dbReady, t, type Appointment } from "@/lib/db";
import { getSession } from "@/lib/panel-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const campo = (v: unknown) => {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!dbReady) return NextResponse.json({ ok: false }, { status: 503 });

  const filtro = req.nextUrl.searchParams.get("f") ?? "proximas";
  const sql = db();
  let citas: Appointment[] = [];
  try {
    citas =
      filtro === "proximas"
        ? await sql<Appointment[]>`select * from ${t("appointments")} where status = 'pagada' and slot_start >= now() order by slot_start limit 2000`
        : filtro === "pasadas"
          ? await sql<Appointment[]>`select * from ${t("appointments")} where status = 'pagada' and slot_start < now() order by slot_start limit 2000`
          : await sql<Appointment[]>`select * from ${t("appointments")} where status = 'pagada' order by slot_start limit 2000`;
  } catch (err) {
    console.error("[panel/csv]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const encabezados = [
    "folio", "fecha", "nombre", "correo", "telefono", "area", "modalidad",
    "entidad", "municipio", "descripcion", "fecha_proxima", "origen",
    "importe_mxn", "promocion", "pago_stripe", "pagada_el",
  ];

  const filas = citas.map((c) =>
    [
      c.folio,
      formatDateTimeLong(c.slot_start),
      c.nombre,
      c.correo,
      c.telefono,
      c.area,
      c.modalidad,
      c.entidad,
      c.municipio,
      c.descripcion,
      c.fecha_proxima,
      c.origen,
      (c.precio_centavos / 100).toFixed(2),
      c.promo_aplicada ? "sí" : "no",
      c.stripe_payment_intent,
      c.paid_at ? formatDateTimeLong(c.paid_at) : "",
    ].map(campo).join(","),
  );

  // BOM para que Excel en Windows respete los acentos.
  const csv = `\uFEFF${encabezados.join(",")}\n${filas.join("\n")}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="veritum-citas-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
