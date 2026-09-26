import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { db, dbReady, fn, t, type Contacto, type Recordatorio } from "./db";
import { TZ } from "./booking";

// Seguimiento de contactos con n8n.
//
// n8n avisa cada vez que habla con una persona y aquí se guarda la hora. Si esa
// hora no se actualiza, se manda un recordatorio al webhook de n8n a la hora, a
// las 3 horas y a las 24 horas. Cada recordatorio se manda UNA SOLA VEZ por
// teléfono, para siempre.
//
// El vencimiento lo decide SIEMPRE la base de datos comparando contra now():
// esta aplicación no tiene reloj propio (no hay cron y el contenedor se
// reinicia en cada despliegue), así que nada depende de la memoria del proceso.
// Lo único que hace falta desde fuera es que alguien llame a `barrer()`: el nodo
// Schedule de n8n cada 5 minutos, más el barrido oportunista de cada alta.

/** Umbrales de inactividad en minutos: 1 h, 3 h y 24 h. */
export const UMBRALES: readonly [number, number, number] = [
  Number(process.env.SEGUIMIENTO_MIN_1 ?? 60),
  Number(process.env.SEGUIMIENTO_MIN_2 ?? 180),
  Number(process.env.SEGUIMIENTO_MIN_3 ?? 1440),
];

/** Recordatorios que se mandan como máximo en cada barrido. */
const LOTE = 25;
/** Tiempo límite de la llamada al webhook. */
const TIMEOUT_MS = 8_000;
/** Intentos por recordatorio antes de darlo por fallido para siempre. */
const MAX_INTENTOS = 3;
/** Minutos tras los que un envío que quedó "pendiente" se considera huérfano. */
const HUERFANO_MIN = 10;
/** Segundos mínimos entre barridos oportunistas de un mismo proceso. */
const GRACIA_SEG = 30;
/** Envíos simultáneos al webhook: suficiente para ir rápido sin golpearlo. */
const EN_PARALELO = 4;

export const webhookUrl = () => process.env.SEGUIMIENTO_WEBHOOK_URL?.trim() || undefined;
const apiToken = () => process.env.SEGUIMIENTO_API_TOKEN?.trim() || undefined;

export const tokenConfigurado = () => Boolean(apiToken());
/** Sin webhook no se manda nada: así un entorno de pruebas no dispara mensajes reales. */
export const seguimientoConfigurado = () => Boolean(dbReady && apiToken() && webhookUrl());

/**
 * Comprueba la cabecera `Authorization: Bearer …` en tiempo constante.
 * Se comparan los SHA-256 y no los textos para que la comparación no dependa de
 * la longitud del token recibido.
 */
export const tokenValido = (cabecera: string | null) => {
  const esperado = apiToken();
  if (!esperado) return false;
  const recibido = (cabecera ?? "").replace(/^Bearer\s+/i, "").trim();
  const a = createHash("sha256").update(recibido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
};

/**
 * Clave canónica de una persona: los 10 últimos dígitos del teléfono.
 * Por construcción descarta la lada de país (+52 / 52) y el 1 antiguo de los
 * celulares mexicanos: "+52 1 55 1234 5678" → "5512345678".
 *
 * Es exactamente lo mismo que `right(regexp_replace(telefono,'[^0-9]','','g'),10)`
 * en SQL, así que el cruce con las citas usa el índice y la lógica no se duplica.
 *
 * Devuelve null si no parece un teléfono.
 */
export const normalizarTelefono = (valor: string): string | null => {
  const digitos = (valor ?? "").replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 15) return null;
  return digitos.slice(-10);
};

// ---------------------------------------------------------------------------
// Alta y consulta de contactos
// ---------------------------------------------------------------------------

/**
 * Registra (o actualiza) la última hora de contacto de una persona.
 * Devuelve null si el teléfono no es normalizable.
 */
export const registrarContacto = async (entrada: {
  telefono: string;
  ultimoContacto?: Date | null;
  datos?: Record<string, unknown>;
}): Promise<Contacto | null> => {
  const norm = normalizarTelefono(entrada.telefono);
  if (!norm) return null;

  const sql = db();
  const [fila] = await sql<Contacto[]>`
    insert into ${t("contactos")} as c (telefono_normalizado, telefono, ultimo_contacto, datos)
    values (
      ${norm},
      ${entrada.telefono.trim()},
      ${entrada.ultimoContacto ?? new Date()},
      ${sql.json((entrada.datos ?? {}) as never)}
    )
    on conflict (telefono_normalizado) do update
       set telefono = excluded.telefono,
           -- El reloj nunca va hacia atrás (un reintento de n8n fuera de orden
           -- no reabre recordatorios ya resueltos) ni hacia el futuro (un reloj
           -- adelantado en n8n no puede silenciar el seguimiento para siempre).
           ultimo_contacto = greatest(c.ultimo_contacto, least(excluded.ultimo_contacto, now())),
           datos = c.datos || excluded.datos,
           contactos_recibidos = c.contactos_recibidos + 1,
           updated_at = now()
    returning *`;
  return fila ?? null;
};

export const obtenerContacto = async (
  telefono: string,
): Promise<{ contacto: Contacto; recordatorios: Recordatorio[] } | null> => {
  const norm = normalizarTelefono(telefono);
  if (!norm) return null;

  const sql = db();
  const [contacto] = await sql<Contacto[]>`
    select * from ${t("contactos")} where telefono_normalizado = ${norm}`;
  if (!contacto) return null;

  const recordatorios = await sql<Recordatorio[]>`
    select * from ${t("recordatorios")} where contacto_id = ${contacto.id} order by numero asc`;
  return { contacto, recordatorios };
};

// ---------------------------------------------------------------------------
// Envío al webhook de n8n
// ---------------------------------------------------------------------------

export type DatosCliente = {
  nombre: string;
  folio: string;
  status: string;
  /** Instante en UTC. */
  slot_start: string;
  /** El mismo horario en hora de Ciudad de México. */
  slot_start_local: string;
};

export type PayloadRecordatorio = {
  evento: "recordatorio_seguimiento";
  recordatorio: number;
  telefono: string;
  telefono_normalizado: string;
  /** Instante exacto, en UTC con desfase: para comparar y calcular. */
  ultimo_contacto: string;
  /** El mismo instante escrito en hora de Ciudad de México: para el mensaje. */
  ultimo_contacto_local: string;
  minutos_inactividad: number;
  horas_inactividad: number;
  umbral_minutos: number;
  /** Datos de la cita si el teléfono coincide con una; null si no hay ninguna. */
  cliente: DatosCliente | null;
  enviado_at: string;
  enviado_at_local: string;
  /** Zona en la que están escritos los campos _local. */
  zona: string;
};

/**
 * Fecha y hora en la zona de trabajo (Ciudad de México), legible por una
 * persona. El instante en UTC también viaja en el payload: n8n redacta con el
 * campo local y calcula con el otro.
 */
export const enHoraLocal = (d: Date) =>
  new Intl.DateTimeFormat("es-MX", {
    timeZone: TZ,
    dateStyle: "long",
    timeStyle: "short",
    hour12: false,
  }).format(d);

/** Busca la cita de ese teléfono para poder personalizar el mensaje en n8n. */
const buscarCita = async (norm: string): Promise<DatosCliente | null> => {
  const sql = db();
  const [fila] = await sql<{ nombre: string; folio: string; status: string; slot_start: Date }[]>`
    select nombre, folio, status, slot_start
      from ${t("appointments")}
     where right(regexp_replace(telefono, '[^0-9]', '', 'g'), 10) = ${norm}
     order by (status = 'pagada') desc, slot_start desc
     limit 1`;
  if (!fila) return null;
  return {
    nombre: fila.nombre,
    folio: fila.folio,
    status: fila.status,
    slot_start: fila.slot_start.toISOString(),
    slot_start_local: enHoraLocal(fila.slot_start),
  };
};

type ResultadoEnvio = { ok: boolean; status: number | null; error?: string; respuesta?: string };

/** Nunca lanza: devuelve el fallo y quien llama decide, igual que `sendMail`. */
const enviarWebhook = async (payload: PayloadRecordatorio): Promise<ResultadoEnvio> => {
  const url = webhookUrl();
  if (!url) return { ok: false, status: null, error: "SEGUIMIENTO_WEBHOOK_URL sin configurar" };

  const firma = process.env.SEGUIMIENTO_WEBHOOK_SECRET?.trim();
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        ...(firma ? { "x-veritum-firma": firma } : {}),
      },
      body: JSON.stringify(payload),
    });
    const respuesta = (await res.text().catch(() => "")).slice(0, 500);
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}`, respuesta };
    return { ok: true, status: res.status, respuesta };
  } catch (err) {
    console.error("[seguimiento] Error al llamar al webhook", err);
    return { ok: false, status: null, error: err instanceof Error ? err.message : "fallo de red" };
  }
};

// ---------------------------------------------------------------------------
// Barrido: reclamar → enviar → registrar el resultado
// ---------------------------------------------------------------------------

type Reclamado = {
  recordatorio_id: number;
  telefono: string;
  telefono_normalizado: string;
  numero: number;
  ultimo_contacto: Date;
  minutos_inactividad: number;
};

export type ResumenBarrido = {
  reclamados: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
  reintentos: number;
  detalle: { telefono: string; recordatorio: number; estado: "enviado" | "fallido"; http_status: number | null; error?: string }[];
};

const vacio = (): ResumenBarrido => ({ reclamados: 0, enviados: 0, fallidos: 0, omitidos: 0, reintentos: 0, detalle: [] });

/** Procesa un recordatorio ya reclamado: arma el payload, lo manda y anota el resultado. */
const procesar = async (r: Reclamado): Promise<{ ok: boolean; status: number | null; error?: string }> => {
  const sql = db();
  const umbral = UMBRALES[r.numero - 1] ?? UMBRALES[0];
  const cliente = await buscarCita(r.telefono_normalizado).catch((err) => {
    console.error("[seguimiento] No se pudo buscar la cita", err);
    return null;
  });

  const ahora = new Date();
  const payload: PayloadRecordatorio = {
    evento: "recordatorio_seguimiento",
    recordatorio: r.numero,
    telefono: r.telefono,
    telefono_normalizado: r.telefono_normalizado,
    ultimo_contacto: r.ultimo_contacto.toISOString(),
    ultimo_contacto_local: enHoraLocal(r.ultimo_contacto),
    minutos_inactividad: r.minutos_inactividad,
    horas_inactividad: Math.round((r.minutos_inactividad / 60) * 10) / 10,
    umbral_minutos: umbral,
    cliente,
    enviado_at: ahora.toISOString(),
    enviado_at_local: enHoraLocal(ahora),
    zona: TZ,
  };

  const res = await enviarWebhook(payload);

  try {
    if (res.ok) {
      await sql`
        update ${t("recordatorios")}
           set estado = 'enviado', enviado_at = now(), intentos = intentos + 1,
               http_status = ${res.status}, error = null, reintentar_at = null,
               payload = ${sql.json(payload as never)}, respuesta = ${res.respuesta ?? null}
         where id = ${r.recordatorio_id}`;
    } else {
      // El hueco del contacto queda cerrado para siempre; el reintento vive aquí,
      // con tope, para no perder un seguimiento por un corte de red de dos segundos.
      await sql`
        update ${t("recordatorios")}
           set estado = 'fallido', intentos = intentos + 1,
               http_status = ${res.status}, error = ${res.error ?? "desconocido"},
               payload = ${sql.json(payload as never)},
               reintentar_at = case
                 when intentos + 1 >= ${MAX_INTENTOS} then null
                 when intentos + 1 = 1 then now() + interval '2 minutes'
                 else now() + interval '10 minutes'
               end
         where id = ${r.recordatorio_id}`;
    }
  } catch (err) {
    console.error("[seguimiento] No se pudo anotar el resultado del recordatorio", err);
  }

  return { ok: res.ok, status: res.status, error: res.error };
};

/** Ejecuta las promesas en tandas para no golpear el webhook de n8n. */
const enTandas = async <T, R>(items: T[], tamano: number, tarea: (item: T) => Promise<R>): Promise<R[]> => {
  const salida: R[] = [];
  for (let i = 0; i < items.length; i += tamano) {
    salida.push(...(await Promise.all(items.slice(i, i + tamano).map(tarea))));
  }
  return salida;
};

/**
 * Un barrido completo: pregunta a la base de datos a quién le toca (comparando
 * contra now()), manda los recordatorios y anota qué pasó.
 */
export const barrer = async (opts?: { limite?: number }): Promise<ResumenBarrido> => {
  if (!dbReady) return vacio();
  const limite = Math.max(1, Math.min(LOTE, opts?.limite ?? LOTE));
  const sql = db();
  const resumen = vacio();

  type FilaReclamo = {
    o_recordatorio_id: string;
    o_telefono: string;
    o_telefono_normalizado: string;
    o_numero: number;
    o_ultimo_contacto: Date;
    o_minutos_inactividad: number;
    o_omitidos?: number[];
  };

  const mapear = (f: FilaReclamo): Reclamado => ({
    recordatorio_id: Number(f.o_recordatorio_id),
    telefono: f.o_telefono,
    telefono_normalizado: f.o_telefono_normalizado,
    numero: Number(f.o_numero),
    ultimo_contacto: f.o_ultimo_contacto,
    minutos_inactividad: Number(f.o_minutos_inactividad),
  });

  let pendientes: Reclamado[] = [];
  try {
    const nuevos = await sql<FilaReclamo[]>`
      select * from ${sql.unsafe(fn("reclamar_recordatorios"))}(
        ${UMBRALES[0]}, ${UMBRALES[1]}, ${UMBRALES[2]}, ${limite})`;
    resumen.omitidos = nuevos.reduce((n, f) => n + (f.o_omitidos?.length ?? 0), 0);
    pendientes = nuevos.map(mapear);

    const reintentos = await sql<FilaReclamo[]>`
      select * from ${sql.unsafe(fn("reclamar_reintentos"))}(
        ${MAX_INTENTOS}, ${HUERFANO_MIN}, ${limite})`;
    resumen.reintentos = reintentos.length;
    pendientes = [...pendientes, ...reintentos.map(mapear)];
  } catch (err) {
    console.error("[seguimiento] Error al reclamar recordatorios", err);
    return resumen;
  }

  resumen.reclamados = pendientes.length;
  if (pendientes.length === 0) return resumen;

  const resultados = await enTandas(pendientes, EN_PARALELO, async (r) => ({ r, res: await procesar(r) }));
  for (const { r, res } of resultados) {
    if (res.ok) resumen.enviados += 1;
    else resumen.fallidos += 1;
    resumen.detalle.push({
      telefono: r.telefono_normalizado,
      recordatorio: r.numero,
      estado: res.ok ? "enviado" : "fallido",
      http_status: res.status,
      ...(res.error ? { error: res.error } : {}),
    });
  }
  return resumen;
};

// --- Barrido oportunista ---------------------------------------------------
// Red de seguridad por si el nodo Schedule de n8n no está configurado: cada alta
// de contacto dispara un barrido. La protección real contra duplicados la da la
// base de datos; esto solo evita barridos innecesarios en un mismo proceso.

let enCurso: Promise<ResumenBarrido> | null = null;
let ultimoBarrido = 0;

/** true si ya hay un barrido corriendo en este proceso. */
export const barridoEnCurso = () => enCurso !== null;

export const barrerEnSegundoPlano = async (): Promise<void> => {
  if (!seguimientoConfigurado()) return;
  if (enCurso) return;
  if (Date.now() - ultimoBarrido < GRACIA_SEG * 1000) return;
  ultimoBarrido = Date.now();
  enCurso = barrer().finally(() => {
    enCurso = null;
  });
  try {
    await enCurso;
  } catch (err) {
    console.error("[seguimiento] Barrido oportunista", err);
  }
};

// ---------------------------------------------------------------------------
// Lecturas para el panel
// ---------------------------------------------------------------------------

/** Contacto con el dato de si está en pausa por tener ya una cita agendada. */
export type ContactoConCita = Contacto & { con_cita: boolean };

export const ultimosContactos = async (limite = 20): Promise<ContactoConCita[]> => {
  if (!dbReady) return [];
  try {
    const sql = db();
    return await sql<ContactoConCita[]>`
      select c.*, ${sql.unsafe(fn("tiene_cita_agendada"))}(c.telefono_normalizado) as con_cita
        from ${t("contactos")} c
       order by c.updated_at desc
       limit ${limite}`;
  } catch (err) {
    console.error("[seguimiento] ultimosContactos", err);
    return [];
  }
};

export type RecordatorioConTelefono = Recordatorio & { telefono: string };

export const ultimosRecordatorios = async (limite = 20): Promise<RecordatorioConTelefono[]> => {
  if (!dbReady) return [];
  try {
    return await db()<RecordatorioConTelefono[]>`
      select r.*, c.telefono
        from ${t("recordatorios")} r
        join ${t("contactos")} c on c.id = r.contacto_id
       order by r.created_at desc
       limit ${limite}`;
  } catch (err) {
    console.error("[seguimiento] ultimosRecordatorios", err);
    return [];
  }
};

export type ResumenSeguimiento = {
  contactos: number;
  enSeguimiento: number;
  /** En pausa porque ya tienen una cita agendada. */
  conCita: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
};

export const resumenSeguimiento = async (): Promise<ResumenSeguimiento | null> => {
  if (!dbReady) return null;
  try {
    const sql = db();
    const [fila] = await sql<{ contactos: string; en_seguimiento: string; con_cita: string }[]>`
      select count(*) as contactos,
             count(*) filter (
               where recordatorios_resueltos < 3
                 and not ${sql.unsafe(fn("tiene_cita_agendada"))}(telefono_normalizado)
             ) as en_seguimiento,
             count(*) filter (
               where ${sql.unsafe(fn("tiene_cita_agendada"))}(telefono_normalizado)
             ) as con_cita
        from ${t("contactos")}`;
    const [estados] = await sql<{ enviados: string; fallidos: string; omitidos: string }[]>`
      select count(*) filter (where estado = 'enviado') as enviados,
             count(*) filter (where estado = 'fallido') as fallidos,
             count(*) filter (where estado = 'omitido') as omitidos
        from ${t("recordatorios")}`;
    return {
      contactos: Number(fila?.contactos ?? 0),
      enSeguimiento: Number(fila?.en_seguimiento ?? 0),
      conCita: Number(fila?.con_cita ?? 0),
      enviados: Number(estados?.enviados ?? 0),
      fallidos: Number(estados?.fallidos ?? 0),
      omitidos: Number(estados?.omitidos ?? 0),
    };
  } catch (err) {
    console.error("[seguimiento] resumenSeguimiento", err);
    return null;
  }
};

/**
 * Reinicia los tres recordatorios de un teléfono. Es una acción MANUAL del
 * panel: nada automático reactiva a nadie, así la regla de "nunca se repite"
 * sigue intacta, pero un cliente que vuelve meses después no queda huérfano.
 */
export const reiniciarRecordatorios = async (telefono: string): Promise<boolean> => {
  const norm = normalizarTelefono(telefono);
  if (!norm || !dbReady) return false;
  try {
    const sql = db();
    const filas = await sql`
      update ${t("contactos")}
         set recordatorio_1_at = null, recordatorio_2_at = null, recordatorio_3_at = null,
             recordatorios_resueltos = 0, ultimo_contacto = now(), updated_at = now()
       where telefono_normalizado = ${norm}
      returning id`;
    if (filas.length === 0) return false;
    await sql`delete from ${t("recordatorios")} where telefono_normalizado = ${norm}`;
    return true;
  } catch (err) {
    console.error("[seguimiento] reiniciarRecordatorios", err);
    return false;
  }
};
