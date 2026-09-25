// Descarga de un documento desde el panel interno.
// Mismo patrón de autenticación que /api/panel/citas.csv: la sesión del panel.

import { NextResponse, type NextRequest } from "next/server";
import { dbReady } from "@/lib/db";
import { cabecerasDescarga, leerDocumento } from "@/lib/documentos";
import { getSession } from "@/lib/panel-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/panel/documentos/[id]">) {
  if (!(await getSession())) return new NextResponse(null, { status: 401 });
  if (!dbReady) return new NextResponse(null, { status: 503 });

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return new NextResponse(null, { status: 404 });

  try {
    const doc = await leerDocumento(id);
    if (!doc) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(doc.contenido), { headers: cabecerasDescarga(doc.nombre) });
  } catch (err) {
    console.error("[panel/descarga]", err);
    return new NextResponse(null, { status: 500 });
  }
}
