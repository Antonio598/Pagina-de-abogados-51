// Medición propia. Solo agrega datos de tráfico: ruta, área, dispositivo,
// host de referencia, UTM y duración. Sin IP, sin cookies de seguimiento y sin
// ningún dato personal. Alimenta las métricas del panel interno.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db, supabaseReady } from "@/lib/db";

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
  if (!supabaseReady) return NextResponse.json({ ok: true, guardado: false });

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
    if (d.tipo === "view") {
      await db().from("page_events").insert({
        session_id: d.sid,
        path: d.path,
        area: d.area,
        device: d.device ?? null,
        referrer_host: d.referrer_host ?? null,
        utm_source: d.utm_source ?? null,
        utm_medium: d.utm_medium ?? null,
        utm_campaign: d.utm_campaign ?? null,
      });
    } else {
      // Guarda la mayor duración observada para esa sesión y ruta.
      const { data } = await db()
        .from("page_events")
        .select("id, duracion_ms")
        .eq("session_id", d.sid)
        .eq("path", d.path)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && (data.duracion_ms ?? 0) < (d.duracion_ms ?? 0)) {
        await db().from("page_events").update({ duracion_ms: d.duracion_ms }).eq("id", data.id);
      }
    }
  } catch (err) {
    console.error("[metrics]", err);
  }

  return new NextResponse(null, { status: 204 });
}
