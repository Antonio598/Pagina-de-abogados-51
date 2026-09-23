import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para uso exclusivo en el servidor. Usa la service role
// key, que ignora RLS: nunca debe importarse desde un componente de cliente
// (el paquete "server-only" hace fallar la compilación si ocurre).
//
// Todo vive en el esquema `veritum`, no en `public`, para poder compartir el
// proyecto de Supabase con otras aplicaciones. Ese esquema debe estar en
// Settings → API → "Exposed schemas" o las consultas fallan con PGRST106.

// El tipo se infiere de createClient para que respete el esquema configurado.
type Cliente = ReturnType<typeof crear>;
let client: Cliente | null = null;

const crear = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "veritum-web" } },
  });

/** Esquema propio dentro del proyecto de Supabase. */
export const SCHEMA = process.env.SUPABASE_SCHEMA?.trim() || "veritum";

export const supabaseReady = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const db = (): Cliente => {
  if (!supabaseReady) {
    throw new Error("Supabase no está configurado: define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  }
  client ??= crear();
  return client;
};

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
  slot_start: string;
  slot_end: string;
  hold_expires_at: string | null;
  nombre: string;
  correo: string;
  telefono: string;
  area: string;
  modalidad: string | null;
  entidad: string | null;
  municipio: string | null;
  descripcion: string | null;
  fecha_proxima: string | null;
  canal: string | null;
  precio_centavos: number;
  moneda: string;
  promo_aplicada: boolean;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  paid_at: string | null;
  aviso_version: string | null;
  consentimiento_at: string | null;
  utm: Record<string, string>;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityRule = {
  id: string;
  weekday: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at: string;
};

export type AvailabilityBlock = {
  id: string;
  inicio: string;
  fin: string;
  motivo: string | null;
  created_at: string;
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
  created_at: string;
};
