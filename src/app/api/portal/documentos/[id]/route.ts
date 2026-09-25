// Descarga de un documento por su propio dueño.
//
// El cliente puede bajar lo que él subió: entró con el mismo par de datos que se
// le pidió para subirlo, y negárselo rompería el caso real ("¿subí bien el
// citatorio?").
//
// La comprobación es doble: sesión válida Y que el documento sea de ese
// teléfono. Nunca se busca solo por id: un id no es una credencial.

import { NextResponse, type NextRequest } from "next/server";
import { dbReady } from "@/lib/db";
import { cabecerasDescarga, leerDocumentoDeCliente } from "@/lib/documentos";
import { getSesionPortal } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/portal/documentos/[id]">) {
  const sesion = await getSesionPortal();
  if (!sesion || !dbReady) return new NextResponse(null, { status: 404 });

  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return new NextResponse(null, { status: 404 });

  try {
    const doc = await leerDocumentoDeCliente(id, sesion.tel);
    // Mismo 404 para "no existe" y para "no es tuyo": no se confirma la
    // existencia de documentos de otras personas.
    if (!doc) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(doc.contenido), { headers: cabecerasDescarga(doc.nombre) });
  } catch (err) {
    console.error("[portal/descarga]", err);
    return new NextResponse(null, { status: 500 });
  }
}
