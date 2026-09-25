import "server-only";
import { createHash } from "node:crypto";
import { COLS_DOCUMENTO, db, dbReady, t, type Documento } from "./db";

// Documentos que el cliente carga en el portal.
//
// El contenido se guarda en la base de datos: el contenedor corre como usuario
// sin privilegios, no tiene directorio escribible y no hay volumen montado, así
// que un archivo en disco desaparecería en el siguiente despliegue.
//
// Regla que este módulo hace cumplir: `contenido` solo se lee por id, desde la
// ruta de descarga. Todo lo demás usa COLS_DOCUMENTO, que lo excluye.

export const TOPE_BYTES = 15 * 1024 * 1024;
export const TOPE_POR_ENVIO = 3;
export const TOPE_POR_CLIENTE = 20;

/**
 * Extensión → tipo canónico. El `type` que manda el navegador se IGNORA: lo
 * decide la extensión, y la extensión se comprueba contra el contenido real.
 */
export const permitidos = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export type Extension = keyof typeof permitidos;

export const extensionesTexto = "PDF, JPG, PNG, WEBP, HEIC, DOCX y XLSX";

export const extensionDe = (nombre: string): Extension | null => {
  const ext = nombre.toLowerCase().split(".").pop() ?? "";
  return ext in permitidos ? (ext as Extension) : null;
};

const empiezaCon = (buf: Uint8Array, bytes: number[], offset = 0) =>
  bytes.every((b, i) => buf[offset + i] === b);

const texto = (buf: Uint8Array, offset: number, largo: number) =>
  new TextDecoder("latin1").decode(buf.subarray(offset, offset + largo));

/**
 * Comprueba que el contenido corresponda a la extensión. Es lo que atrapa un
 * HTML o un ejecutable renombrado a .pdf: sin esto, la lista blanca de
 * extensiones no sirve de nada.
 */
export const firmaCoincide = (ext: Extension, buf: Uint8Array): boolean => {
  if (buf.length < 12) return false;
  switch (ext) {
    case "pdf":
      // "%PDF-". Algunos generadores dejan basura delante, así que se busca
      // dentro de los primeros 1024 bytes, como hace la propia especificación.
      return texto(buf, 0, Math.min(1024, buf.length)).includes("%PDF-");
    case "png":
      return empiezaCon(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "jpg":
    case "jpeg":
      return empiezaCon(buf, [0xff, 0xd8, 0xff]);
    case "webp":
      return texto(buf, 0, 4) === "RIFF" && texto(buf, 8, 4) === "WEBP";
    case "heic":
      // Caja ftyp en el offset 4, con una marca de la familia HEIF.
      return texto(buf, 4, 4) === "ftyp" && /heic|heix|hevc|mif1|msf1/.test(texto(buf, 8, 4));
    case "docx":
    case "xlsx":
      // Son zip. No se abre el zip: basta la firma, porque el archivo nunca se
      // ejecuta ni se descomprime en el servidor.
      return empiezaCon(buf, [0x50, 0x4b, 0x03, 0x04]);
    default:
      return false;
  }
};

/**
 * Nombre seguro para guardar y para devolver en la cabecera de descarga.
 * Sin rutas, sin comillas, sin saltos de línea y sin caracteres de control.
 */
export const nombreSeguro = (n: string): string => {
  const limpio = (n ?? "")
    .split(/[/\\]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f"';]/g, "")
    .replace(/[^\p{L}\p{N} .,_()-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return limpio.length > 0 ? limpio : "documento";
};

export const sha256 = (buf: Uint8Array) => createHash("sha256").update(buf).digest("hex");

export const pesoLegible = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ---------------------------------------------------------------------------
// Acceso a datos
// ---------------------------------------------------------------------------

export type ErrorCarga = "tamano" | "tipo" | "contenido" | "cantidad" | "tope" | "vacio" | "generico";

export const contarDocumentos = async (telefonoNormalizado: string): Promise<number> => {
  const sql = db();
  const [fila] = await sql<{ n: string }[]>`
    select count(*) as n from ${t("documentos")}
     where telefono_normalizado = ${telefonoNormalizado} and eliminado_at is null`;
  return Number(fila?.n ?? 0);
};

export const listarDocumentos = async (telefonoNormalizado: string): Promise<Documento[]> => {
  if (!dbReady) return [];
  const sql = db();
  return sql<Documento[]>`
    select ${sql.unsafe(COLS_DOCUMENTO)} from ${t("documentos")}
     where telefono_normalizado = ${telefonoNormalizado} and eliminado_at is null
     order by created_at desc`;
};

export const guardarDocumento = async (d: {
  telefonoNormalizado: string;
  appointmentId: string | null;
  folio: string | null;
  nombre: string;
  extension: Extension;
  contenido: Uint8Array;
  subidoPor?: "cliente" | "despacho";
}): Promise<void> => {
  const sql = db();
  await sql`
    insert into ${t("documentos")}
      (telefono_normalizado, appointment_id, folio, nombre_archivo, extension, mime,
       tamano_bytes, sha256, contenido, subido_por)
    values (
      ${d.telefonoNormalizado}, ${d.appointmentId}, ${d.folio},
      ${nombreSeguro(d.nombre)}, ${d.extension}, ${permitidos[d.extension]},
      ${d.contenido.byteLength}, ${sha256(d.contenido)}, ${Buffer.from(d.contenido)},
      ${d.subidoPor ?? "cliente"}
    )`;
};

/** Lee el contenido de un documento. Es el ÚNICO sitio que lo hace. */
export const leerDocumento = async (
  id: string,
): Promise<{ nombre: string; contenido: Buffer } | null> => {
  const sql = db();
  const [fila] = await sql<{ nombre_archivo: string; contenido: Buffer; telefono_normalizado: string }[]>`
    select nombre_archivo, contenido, telefono_normalizado
      from ${t("documentos")}
     where id = ${id}::uuid and eliminado_at is null`;
  if (!fila) return null;
  return { nombre: fila.nombre_archivo, contenido: fila.contenido };
};

/**
 * Lee el contenido comprobando además que el documento sea de ese cliente.
 * Nunca se busca solo por id desde el portal: el id no es una credencial.
 */
export const leerDocumentoDeCliente = async (
  id: string,
  telefonoNormalizado: string,
): Promise<{ nombre: string; contenido: Buffer } | null> => {
  const sql = db();
  const [fila] = await sql<{ nombre_archivo: string; contenido: Buffer }[]>`
    select nombre_archivo, contenido
      from ${t("documentos")}
     where id = ${id}::uuid
       and telefono_normalizado = ${telefonoNormalizado}
       and eliminado_at is null`;
  if (!fila) return null;
  return { nombre: fila.nombre_archivo, contenido: fila.contenido };
};

/**
 * Cabeceras de descarga. Neutras a propósito: si algún día se colara un archivo
 * interpretable, no podría ejecutarse en el origen del sitio.
 */
export const cabecerasDescarga = (nombre: string) => {
  const seguro = nombreSeguro(nombre);
  return {
    "content-type": "application/octet-stream",
    "content-disposition": `attachment; filename="${seguro}"; filename*=UTF-8''${encodeURIComponent(seguro)}`,
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; sandbox",
    "referrer-policy": "no-referrer",
    "cache-control": "no-store, private",
  };
};
