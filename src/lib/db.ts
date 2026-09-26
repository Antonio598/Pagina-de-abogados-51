import "server-only";
import postgres from "postgres";

// Conexión directa a PostgreSQL (Supabase autoalojado o gestionado).
//
// Se usa el driver de Postgres y no la API REST porque:
//   · da transacciones reales, necesarias para apartar un horario sin duplicados;
//   · no depende de que el esquema esté "expuesto" en la configuración de la API;
//   · no depende del certificado del dominio de Supabase.
//
// Todo vive en el esquema `veritum`, aparte de `public`, para poder compartir la
// misma base de datos con otras aplicaciones.
//
// Solo servidor: "server-only" hace fallar la compilación si alguien lo importa
// desde un componente de cliente.

export const SCHEMA = process.env.DB_SCHEMA?.trim() || "veritum";
export const dbReady = Boolean(process.env.DATABASE_URL);

/** TLS según el `sslmode` de la cadena de conexión. */
const ssl = () => {
  const modo = /sslmode=([a-z-]+)/i.exec(process.env.DATABASE_URL ?? "")?.[1]?.toLowerCase();
  if (modo === "disable") return false as const;
  if (modo === "no-verify" || process.env.DATABASE_SSL_INSECURE === "true") return { rejectUnauthorized: false };
  return "require" as const;
};

let cliente: postgres.Sql | null = null;

export const db = () => {
  if (!dbReady) throw new Error("Falta DATABASE_URL: la base de datos no está configurada.");
  cliente ??= postgres(process.env.DATABASE_URL!, {
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idle_timeout: 20,
    connect_timeout: 15,
    // Los agrupadores de conexiones (Supavisor, PgBouncer) no admiten sentencias preparadas.
    prepare: false,
    ssl: ssl(),
    onnotice: () => {},
    connection: { application_name: "veritum-web" },
  });
  return cliente;
};

/** Identificador de tabla dentro del esquema del proyecto: t("appointments"). */
export const t = (tabla: string) => db()(`${SCHEMA}.${tabla}`);

/** Nombre calificado de una función del esquema. */
export const fn = (nombre: string) => `${SCHEMA}.${nombre}`;

// ---------------------------------------------------------------------------
// Tipos de las tablas (espejo de supabase/schema.sql)
// ---------------------------------------------------------------------------

export type AppointmentStatus = "pendiente_pago" | "pagada" | "cancelada" | "expirada";
export type AppointmentOrigin = "landing" | "sitio";

export type Appointment = {
  id: string;
  folio: string;
  status: AppointmentStatus;
  origen: AppointmentOrigin;
  slot_start: Date;
  slot_end: Date;
  hold_expires_at: Date | null;
  nombre: string;
  correo: string;
  telefono: string;
  area: string;
  modalidad: string | null;
  entidad: string | null;
  municipio: string | null;
  descripcion: string | null;
  /** Columna de tipo date: el driver la devuelve como Date, no como texto. */
  fecha_proxima: Date | null;
  canal: string | null;
  precio_centavos: number;
  moneda: string;
  promo_aplicada: boolean;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid_at: Date | null;
  aviso_version: string | null;
  consentimiento_at: Date | null;
  utm: Record<string, string>;
  notas: string | null;
  // Defensa laboral: servicio contratado y situación del patrón
  producto_id: string | null;
  situacion: string | null;
  // Crédito de representación. El importe pagado ya es el crédito: aquí solo
  // vive lo que la base no puede deducir.
  credito_vence_at: Date | null;
  credito_aplicado_at: Date | null;
  credito_asunto: string | null;
  credito_notas: string | null;
  enlace_sesion: string | null;
  created_at: Date;
  updated_at: Date;
};

export type AvailabilityRule = {
  id: string;
  weekday: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at: Date;
};

export type AvailabilityBlock = {
  id: string;
  inicio: Date;
  fin: Date;
  motivo: string | null;
  created_at: Date;
};

export type PageEvent = {
  id: number;
  session_id: string;
  path: string;
  area: "sitio" | "landing" | "panel";
  referrer_host: string | null;
  device: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  duracion_ms: number | null;
  created_at: Date;
};

export type RecordatorioEstado = "pendiente" | "enviado" | "fallido" | "omitido";

export type Contacto = {
  id: string;
  telefono_normalizado: string;
  telefono: string;
  ultimo_contacto: Date;
  recordatorio_1_at: Date | null;
  recordatorio_2_at: Date | null;
  recordatorio_3_at: Date | null;
  recordatorios_resueltos: number;
  datos: Record<string, unknown>;
  contactos_recibidos: number;
  created_at: Date;
  updated_at: Date;
};

export type Recordatorio = {
  id: number;
  contacto_id: string;
  telefono_normalizado: string;
  numero: number;
  estado: RecordatorioEstado;
  ultimo_contacto: Date;
  minutos_inactividad: number;
  intentos: number;
  reintentar_at: Date | null;
  http_status: number | null;
  error: string | null;
  payload: Record<string, unknown> | null;
  respuesta: string | null;
  enviado_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * Documento cargado por el cliente en el portal.
 * NO incluye `contenido` a propósito: solo la ruta de descarga lo lee, por id.
 * Dejarlo fuera del tipo hace imposible traer megabytes por accidente.
 */
export type Documento = {
  id: string;
  telefono_normalizado: string;
  appointment_id: string | null;
  folio: string | null;
  nombre_archivo: string;
  extension: string;
  mime: string;
  tamano_bytes: number;
  sha256: string;
  subido_por: "cliente" | "despacho";
  etiqueta: string | null;
  notas: string | null;
  eliminado_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

/** Columnas de `documentos` sin el contenido, para usar en los select. */
export const COLS_DOCUMENTO =
  "id, telefono_normalizado, appointment_id, folio, nombre_archivo, extension, mime, " +
  "tamano_bytes, sha256, subido_por, etiqueta, notas, eliminado_at, created_at, updated_at";
