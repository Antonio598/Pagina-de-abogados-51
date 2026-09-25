import "server-only";
import { db, t } from "./db";
import { normalizarTelefono } from "./seguimiento";

// Búsqueda del expediente del cliente para el portal.

export type CitaPortal = {
  id: string;
  folio: string;
  nombre: string;
  telefono: string;
  situacion: string | null;
  producto_id: string | null;
  slot_start: Date;
  status: string;
  enlace_sesion: string | null;
};

/** Forma del folio que genera `nuevoFolio()`: VER- más 6 caracteres. */
export const FOLIO_RE = /^VER-[A-Z0-9]{6}$/;

/**
 * Busca la cita por teléfono Y folio en UNA sola consulta.
 *
 * Que los dos predicados vayan juntos es deliberado: así el coste y el
 * resultado son idénticos para "folio inexistente" y para "folio correcto con
 * teléfono equivocado". Si se comprobaran por separado, la diferencia de
 * respuesta permitiría enumerar folios válidos.
 *
 * Solo se entra con la cita ya pagada: antes del pago no hay expediente.
 */
export const buscarCitaPortal = async (telefono: string, folio: string): Promise<CitaPortal | null> => {
  const norm = normalizarTelefono(telefono ?? "");
  const f = (folio ?? "").trim().toUpperCase();
  // Si la forma no cuadra se devuelve lo mismo que si no existiera, sin consultar.
  if (!norm || !FOLIO_RE.test(f)) return null;

  const sql = db();
  const [fila] = await sql<CitaPortal[]>`
    select id, folio, nombre, telefono, situacion, producto_id, slot_start, status, enlace_sesion
      from ${t("appointments")}
     where upper(folio) = ${f}
       and right(regexp_replace(telefono, '[^0-9]', '', 'g'), 10) = ${norm}
       and status = 'pagada'
     limit 1`;
  return fila ?? null;
};

/** Recupera la cita de una sesión ya abierta, para pintar el expediente. */
export const citaDeSesion = async (aid: string, tel: string): Promise<CitaPortal | null> => {
  const sql = db();
  const [fila] = await sql<CitaPortal[]>`
    select id, folio, nombre, telefono, situacion, producto_id, slot_start, status, enlace_sesion
      from ${t("appointments")}
     where id = ${aid}::uuid
       and right(regexp_replace(telefono, '[^0-9]', '', 'g'), 10) = ${tel}
     limit 1`;
  return fila ?? null;
};
