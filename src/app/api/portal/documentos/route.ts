// Carga de documentos del portal del cliente.
//
// Es un Route Handler y no una Server Action a propósito: las Server Actions
// están topadas en 1 MB y un citatorio escaneado pesa varios megas. Subir ese
// tope en la configuración lo elevaría para TODAS las acciones de la aplicación,
// incluidas las del panel; aquí, además, se puede rechazar por `content-length`
// antes de leer el cuerpo.
//
// Funciona sin JavaScript: el formulario hace POST normal y esta ruta responde
// con una redirección a /portal/expediente con el resultado en la URL.

import { NextResponse, type NextRequest } from "next/server";
import { dbReady } from "@/lib/db";
import {
  contarDocumentos,
  extensionDe,
  firmaCoincide,
  guardarDocumento,
  TOPE_BYTES,
  TOPE_POR_CLIENTE,
  TOPE_POR_ENVIO,
  type ErrorCarga,
} from "@/lib/documentos";
import { getSesionPortal } from "@/lib/portal-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

const rateLimited = (clave: string) => {
  const now = Date.now();
  const list = (hits.get(clave) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) return true;
  list.push(now);
  hits.set(clave, list);
  return false;
};

const volver = (req: NextRequest, params: string) =>
  NextResponse.redirect(new URL(`/portal/expediente?${params}`, req.nextUrl.origin), { status: 303 });

const conError = (req: NextRequest, e: ErrorCarga) => volver(req, `error=${e}`);

export async function POST(req: NextRequest) {
  const sesion = await getSesionPortal();
  if (!sesion) return NextResponse.redirect(new URL("/portal", req.nextUrl.origin), { status: 303 });
  if (!dbReady) return conError(req, "generico");

  if (rateLimited(sesion.tel)) return conError(req, "generico");

  // Rechazo temprano: no se lee el cuerpo si ya se sabe que es demasiado grande.
  const declarado = Number(req.headers.get("content-length") ?? 0);
  if (declarado > (TOPE_BYTES + 1024 * 1024) * TOPE_POR_ENVIO) return conError(req, "tamano");

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    console.error("[portal/documentos] No se pudo leer el formulario", err);
    return conError(req, "tamano");
  }

  const archivos = form
    .getAll("archivos")
    .filter((v): v is File => typeof v === "object" && v !== null && "arrayBuffer" in v)
    .filter((f) => f.size > 0);

  if (archivos.length === 0) return conError(req, "vacio");
  if (archivos.length > TOPE_POR_ENVIO) return conError(req, "cantidad");

  const yaTiene = await contarDocumentos(sesion.tel).catch(() => 0);
  if (yaTiene + archivos.length > TOPE_POR_CLIENTE) return conError(req, "tope");

  // Se valida TODO antes de guardar nada: o entra el envío completo o ninguno.
  const listos: { nombre: string; ext: ReturnType<typeof extensionDe>; bytes: Uint8Array }[] = [];
  for (const archivo of archivos) {
    if (archivo.size > TOPE_BYTES) return conError(req, "tamano");
    const ext = extensionDe(archivo.name);
    if (!ext) return conError(req, "tipo");

    const bytes = new Uint8Array(await archivo.arrayBuffer());
    if (bytes.byteLength === 0) return conError(req, "vacio");
    if (bytes.byteLength > TOPE_BYTES) return conError(req, "tamano");
    // El tipo que declara el navegador no se usa: se comprueba el contenido.
    // Esto es lo que atrapa un HTML renombrado a .pdf.
    if (!firmaCoincide(ext, bytes)) return conError(req, "contenido");

    listos.push({ nombre: archivo.name, ext, bytes });
  }

  try {
    for (const a of listos) {
      await guardarDocumento({
        telefonoNormalizado: sesion.tel,
        appointmentId: sesion.aid,
        folio: sesion.folio,
        nombre: a.nombre,
        extension: a.ext!,
        contenido: a.bytes,
      });
    }
  } catch (err) {
    console.error("[portal/documentos] Error al guardar", err);
    return conError(req, "generico");
  }

  return volver(req, `ok=${listos.length}`);
}
