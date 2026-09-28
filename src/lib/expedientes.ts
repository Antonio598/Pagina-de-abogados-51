import "server-only";
import {
  db,
  dbReady,
  SCHEMA,
  t,
  type EstadoExpediente,
  type Expediente,
  type ExpedienteNota,
} from "./db";

// Expedientes y su bitácora de avance.
//
// El expediente lo crea un trigger cuando la cita queda pagada (ver
// supabase/schema.sql): aquí no se crea nada, solo se lee y se anota el avance.

export const estadosExpediente: { valor: EstadoExpediente; etiqueta: string }[] = [
  { valor: "nuevo", etiqueta: "Nuevo" },
  { valor: "en_analisis", etiqueta: "En análisis" },
  { valor: "con_estrategia", etiqueta: "Con estrategia" },
  { valor: "en_representacion", etiqueta: "En representación" },
  { valor: "cerrado", etiqueta: "Cerrado" },
  { valor: "descartado", etiqueta: "Descartado" },
];

export const etiquetaEstado = (e: string): string =>
  estadosExpediente.find((x) => x.valor === e)?.etiqueta ?? e;

/** Los estados que siguen requiriendo trabajo, para el filtro por omisión. */
export const estadosAbiertos: EstadoExpediente[] = ["nuevo", "en_analisis", "con_estrategia", "en_representacion"];

/** Expediente con los datos de su cita y el conteo de documentos. */
export type ExpedienteConCita = Expediente & {
  nombre: string;
  correo: string;
  telefono: string;
  slot_start: Date;
  producto_id: string | null;
  situacion: string | null;
  precio_centavos: number;
  moneda: string;
  documentos: string;
  notas_n: string;
};

export const listarExpedientes = async (opts?: {
  estado?: string;
  q?: string;
  limite?: number;
}): Promise<ExpedienteConCita[]> => {
  if (!dbReady) return [];
  const sql = db();
  const limite = opts?.limite ?? 200;
  const q = (opts?.q ?? "").trim();
  const digitos = q.replace(/\D/g, "");
  const porTelefono = digitos.length >= 3 ? `%${digitos}%` : null;
  const porTexto = q === "" ? null : `%${q.toUpperCase()}%`;
  // "abiertos" es el filtro por omisión: lo que todavía pide trabajo.
  const estado = opts?.estado ?? "abiertos";

  try {
    return await sql<ExpedienteConCita[]>`
      select e.*, a.nombre, a.correo, a.telefono, a.slot_start, a.producto_id, a.situacion,
             a.precio_centavos, a.moneda,
             (select count(*) from ${t("documentos")} d
               where d.eliminado_at is null
                 and d.telefono_normalizado = right(regexp_replace(a.telefono, '[^0-9]', '', 'g'), 10)
             ) as documentos,
             (select count(*) from ${t("expediente_notas")} n where n.expediente_id = e.id) as notas_n
        from ${t("expedientes")} e
        join ${t("appointments")} a on a.id = e.appointment_id
       where (${estado === "todos"} or (${estado === "abiertos"} and e.estado = any(${estadosAbiertos}))
              or e.estado = ${estado})
         and (
           ${porTexto}::text is null
           or (${porTelefono}::text is not null and right(regexp_replace(a.telefono, '[^0-9]', '', 'g'), 10) like ${porTelefono})
           or upper(e.folio) like ${porTexto}
           or upper(a.nombre) like ${porTexto}
         )
       order by e.updated_at desc
       limit ${limite}`;
  } catch (err) {
    console.error("[expedientes] listar", err);
    return [];
  }
};

export const obtenerExpediente = async (id: string): Promise<ExpedienteConCita | null> => {
  if (!dbReady) return null;
  try {
    const sql = db();
    const [fila] = await sql<ExpedienteConCita[]>`
      select e.*, a.nombre, a.correo, a.telefono, a.slot_start, a.producto_id, a.situacion,
             a.precio_centavos, a.moneda,
             (select count(*) from ${t("documentos")} d
               where d.eliminado_at is null
                 and d.telefono_normalizado = right(regexp_replace(a.telefono, '[^0-9]', '', 'g'), 10)
             ) as documentos,
             (select count(*) from ${t("expediente_notas")} n where n.expediente_id = e.id) as notas_n
        from ${t("expedientes")} e
        join ${t("appointments")} a on a.id = e.appointment_id
       where e.id = ${id}::uuid`;
    return fila ?? null;
  } catch (err) {
    console.error("[expedientes] obtener", err);
    return null;
  }
};

export const notasDe = async (expedienteId: string): Promise<ExpedienteNota[]> => {
  if (!dbReady) return [];
  try {
    return await db()<ExpedienteNota[]>`
      select * from ${t("expediente_notas")}
       where expediente_id = ${expedienteId}::uuid
       order by created_at desc`;
  } catch (err) {
    console.error("[expedientes] notas", err);
    return [];
  }
};

/**
 * Añade una entrada al avance y, si se indica, mueve el estado. Las dos cosas en
 * la misma transacción: el historial y el estado no pueden discrepar.
 */
export const registrarAvance = async (opts: {
  expedienteId: string;
  autor: string;
  nota: string;
  estadoNuevo?: string;
}): Promise<boolean> => {
  const nota = opts.nota.trim();
  if (!dbReady || !nota) return false;
  const valido = estadosExpediente.some((e) => e.valor === opts.estadoNuevo);
  const estado = valido ? opts.estadoNuevo! : null;

  try {
    const sql = db();
    await sql.begin(async (tx) => {
      await tx`
        insert into ${tx(`${SCHEMA}.expediente_notas`)}
          (expediente_id, autor, estado_nuevo, nota)
        values (${opts.expedienteId}::uuid, ${opts.autor}, ${estado}, ${nota})`;
      if (estado) {
        await tx`
          update ${tx(`${SCHEMA}.expedientes`)}
             set estado = ${estado}, updated_at = now()
           where id = ${opts.expedienteId}::uuid`;
      } else {
        await tx`
          update ${tx(`${SCHEMA}.expedientes`)}
             set updated_at = now()
           where id = ${opts.expedienteId}::uuid`;
      }
    });
    return true;
  } catch (err) {
    console.error("[expedientes] registrarAvance", err);
    return false;
  }
};

export const resumenExpedientes = async (): Promise<Record<string, number>> => {
  if (!dbReady) return {};
  try {
    const filas = await db()<{ estado: string; n: string }[]>`
      select estado, count(*) as n from ${t("expedientes")} group by estado`;
    return Object.fromEntries(filas.map((f) => [f.estado, Number(f.n)]));
  } catch (err) {
    console.error("[expedientes] resumen", err);
    return {};
  }
};
