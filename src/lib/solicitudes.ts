import "server-only";
import { db, dbReady, SCHEMA, t, type Appointment, type SolicitudCambio, type TipoSolicitud } from "./db";
import { normalizarTelefono } from "./seguimiento";
import { FOLIO_RE } from "./portal";

// Solicitudes de cancelación y reprogramación.
//
// El cliente SOLICITA desde /mi-cita; el despacho aplica. El horario NO se
// libera hasta que el despacho lo confirma, y eso se le dice al cliente en el
// correo con esas palabras: la decisión no se esconde.

export type CitaMiCita = Pick<
  Appointment,
  "id" | "folio" | "nombre" | "telefono" | "slot_start" | "status" | "producto_id" | "situacion"
>;

/**
 * Busca la cita por teléfono Y folio en una sola consulta, igual que el portal:
 * así el coste y el resultado son idénticos para "folio inexistente" y para
 * "folio correcto con teléfono equivocado", y no se pueden enumerar folios.
 */
export const buscarCitaCliente = async (telefono: string, folio: string): Promise<CitaMiCita | null> => {
  const norm = normalizarTelefono(telefono ?? "");
  const f = (folio ?? "").trim().toUpperCase();
  if (!norm || !FOLIO_RE.test(f)) return null;

  try {
    const sql = db();
    const [fila] = await sql<CitaMiCita[]>`
      select id, folio, nombre, telefono, slot_start, status, producto_id, situacion
        from ${t("appointments")}
       where upper(folio) = ${f}
         and right(regexp_replace(telefono, '[^0-9]', '', 'g'), 10) = ${norm}
         and status = 'pagada'
       limit 1`;
    return fila ?? null;
  } catch (err) {
    console.error("[solicitudes] buscarCitaCliente", err);
    return null;
  }
};

/** Solicitud pendiente de una cita, si la hay. */
export const solicitudPendiente = async (appointmentId: string): Promise<SolicitudCambio | null> => {
  if (!dbReady) return null;
  try {
    const [fila] = await db()<SolicitudCambio[]>`
      select * from ${t("solicitudes_cambio")}
       where appointment_id = ${appointmentId}::uuid and estado = 'pendiente'
       order by created_at desc limit 1`;
    return fila ?? null;
  } catch (err) {
    console.error("[solicitudes] pendiente", err);
    return null;
  }
};

export const crearSolicitud = async (opts: {
  cita: CitaMiCita;
  tipo: TipoSolicitud;
  motivo?: string;
  slotPropuesto?: Date | null;
}): Promise<SolicitudCambio | null> => {
  if (!dbReady) return null;
  try {
    const [fila] = await db()<SolicitudCambio[]>`
      insert into ${t("solicitudes_cambio")}
        (appointment_id, folio, tipo, motivo, slot_propuesto)
      values (
        ${opts.cita.id}::uuid, ${opts.cita.folio}, ${opts.tipo},
        ${opts.motivo?.trim().slice(0, 500) || null}, ${opts.slotPropuesto ?? null}
      )
      returning *`;
    return fila ?? null;
  } catch (err) {
    console.error("[solicitudes] crear", err);
    return null;
  }
};

// --- Lado del panel -------------------------------------------------------

export type SolicitudConCita = SolicitudCambio & {
  nombre: string;
  correo: string;
  telefono: string;
  slot_start: Date;
  cita_status: string;
  producto_id: string | null;
};

export const listarSolicitudes = async (estado = "pendiente", limite = 200): Promise<SolicitudConCita[]> => {
  if (!dbReady) return [];
  try {
    const sql = db();
    return await sql<SolicitudConCita[]>`
      select s.*, a.nombre, a.correo, a.telefono, a.slot_start,
             a.status as cita_status, a.producto_id
        from ${t("solicitudes_cambio")} s
        join ${t("appointments")} a on a.id = s.appointment_id
       where (${estado === "todas"} or s.estado = ${estado})
       order by s.created_at desc
       limit ${limite}`;
  } catch (err) {
    console.error("[solicitudes] listar", err);
    return [];
  }
};

export const contarPendientes = async (): Promise<number> => {
  if (!dbReady) return 0;
  try {
    const [fila] = await db()<{ n: string }[]>`
      select count(*) as n from ${t("solicitudes_cambio")} where estado = 'pendiente'`;
    return Number(fila?.n ?? 0);
  } catch {
    return 0;
  }
};

/**
 * Aplica una cancelación: libera el horario de verdad. Es el único camino por el
 * que un horario pagado vuelve a estar disponible, y siempre lo dispara una
 * persona del despacho.
 */
export const aplicarCancelacion = async (solicitudId: string, autor: string): Promise<boolean> => {
  if (!dbReady) return false;
  try {
    const sql = db();
    await sql.begin(async (tx) => {
      const [s] = await tx<SolicitudCambio[]>`
        update ${tx(`${SCHEMA}.solicitudes_cambio`)}
           set estado = 'aplicada', resuelta_at = now(), resuelta_por = ${autor}
         where id = ${solicitudId}::uuid and estado = 'pendiente'
        returning *`;
      if (!s) return;
      await tx`
        update ${tx(`${SCHEMA}.appointments`)}
           set status = 'cancelada', hold_expires_at = null
         where id = ${s.appointment_id}::uuid`;
    });
    return true;
  } catch (err) {
    console.error("[solicitudes] aplicarCancelacion", err);
    return false;
  }
};

/** Mueve la cita al nuevo horario. El anterior queda libre por el cambio. */
export const aplicarReprogramacion = async (
  solicitudId: string,
  autor: string,
  slotStart: Date,
  slotEnd: Date,
): Promise<boolean> => {
  if (!dbReady) return false;
  try {
    const sql = db();
    let ok = false;
    await sql.begin(async (tx) => {
      const [s] = await tx<SolicitudCambio[]>`
        select * from ${tx(`${SCHEMA}.solicitudes_cambio`)}
         where id = ${solicitudId}::uuid and estado = 'pendiente' for update`;
      if (!s) return;

      // El horario nuevo no puede solaparse con otra cita viva.
      const choque = await tx<{ id: string }[]>`
        select id from ${tx(`${SCHEMA}.appointments`)}
         where status in ('pagada', 'pendiente_pago')
           and id <> ${s.appointment_id}::uuid
           and slot_start < ${slotEnd}
           and slot_end > ${slotStart}
         limit 1`;
      if (choque.length > 0) return;

      await tx`
        update ${tx(`${SCHEMA}.appointments`)}
           set slot_start = ${slotStart}, slot_end = ${slotEnd}
         where id = ${s.appointment_id}::uuid`;
      await tx`
        update ${tx(`${SCHEMA}.solicitudes_cambio`)}
           set estado = 'aplicada', resuelta_at = now(), resuelta_por = ${autor}
         where id = ${solicitudId}::uuid`;
      ok = true;
    });
    return ok;
  } catch (err) {
    console.error("[solicitudes] aplicarReprogramacion", err);
    return false;
  }
};

export const rechazarSolicitud = async (solicitudId: string, autor: string, notas?: string): Promise<boolean> => {
  if (!dbReady) return false;
  try {
    await db()`
      update ${t("solicitudes_cambio")}
         set estado = 'rechazada', resuelta_at = now(), resuelta_por = ${autor},
             notas = ${notas?.trim().slice(0, 500) || null}
       where id = ${solicitudId}::uuid and estado = 'pendiente'`;
    return true;
  } catch (err) {
    console.error("[solicitudes] rechazar", err);
    return false;
  }
};
