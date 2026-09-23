// Medición propia. Solo agrega datos de tráfico: ruta, área, dispositivo,
// host de referencia, UTM y duración. Sin IP, sin cookies de seguimiento y sin
// ningún dato personal. Alimenta las métricas del panel interno.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db, dbReady, t } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  sid: z.string().trim().min(6).max(64),
  path: z.string().trim().max(200),
  area: z.enum(["sitio", "landing", "panel"]),
  device: z.string().trim().max(20).optional(),
  referrer_host: z.string().trim().max(120).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  tipo: z.enum(["view", "duracion"]),
  duracion_ms: z.number().int().min(0).max(6 * 60 * 60 * 1000).optional(),
});

export async function POST(req: NextRequest) {
  if (!dbReady) return NextResponse.json({ ok: true, guardado: false });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 422 });
  const d = parsed.data;

  try {
    const sql = db();
    if (d.tipo === "view") {
      await sql`
        insert into ${t("page_events")} (session_id, path, area, device, referrer_host, utm_source, utm_medium, utm_campaign)
        values (${d.sid}, ${d.path}, ${d.area}, ${d.device ?? null}, ${d.referrer_host ?? null},
                ${d.utm_source ?? null}, ${d.utm_medium ?? null}, ${d.utm_campaign ?? null})`;
    } else {
      // Guarda la mayor duración observada para esa sesión y ruta.
      await sql`
        update ${t("page_events")} e
           set duracion_ms = ${d.duracion_ms ?? 0}
         where e.id = (
           select id from ${t("page_events")}
            where session_id = ${d.sid} and path = ${d.path}
            order by created_at desc limit 1
         )
           and coalesce(e.duracion_ms, 0) < ${d.duracion_ms ?? 0}`;
    }
  } catch (err) {
    console.error("[metrics]", err);
  }

  return new NextResponse(null, { status: 204 });
}
