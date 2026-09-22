import "server-only";
import { db, type AvailabilityBlock, type AvailabilityRule } from "./db";

// Motor de horarios. Todo se guarda en UTC; la zona de trabajo solo se usa
// para interpretar las reglas ("lunes de 10:00 a 14:00") y para mostrar.

export const TZ = process.env.BOOKING_TIMEZONE?.trim() || "America/Mexico_City";
export const SLOT_MINUTES = Number(process.env.BOOKING_SLOT_MINUTES ?? 45);
export const HOLD_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES ?? 20);
/** Anticipación mínima para reservar (evita citas dentro de 10 minutos). */
export const LEAD_MINUTES = Number(process.env.BOOKING_LEAD_MINUTES ?? 120);
/** Cuántos días hacia adelante se ofrecen. */
export const HORIZON_DAYS = Number(process.env.BOOKING_HORIZON_DAYS ?? 21);

// ---------------------------------------------------------------------------
// Utilidades de zona horaria (sin librerías: Intl basta)
// ---------------------------------------------------------------------------

const partsIn = (date: Date, tz: string) => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(
    dtf.formatToParts(date).filter((x) => x.type !== "literal").map((x) => [x.type, x.value]),
  ) as Record<string, string>;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour) % 24,
    minute: Number(p.minute),
    second: Number(p.second),
  };
};

/** Desfase de la zona respecto a UTC, en milisegundos, en ese instante. */
const offsetMs = (date: Date, tz: string) => {
  const p = partsIn(date, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - date.getTime();
};

/** Convierte una hora de pared de la zona a un instante UTC. */
export const zonedToUtc = (year: number, month: number, day: number, hour: number, minute: number, tz = TZ) => {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = new Date(guess - offsetMs(new Date(guess), tz));
  return new Date(guess - offsetMs(first, tz));
};

/** "2026-10-15" → partes numéricas. */
export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
};

/** Fecha de hoy en la zona de trabajo, como "AAAA-MM-DD". */
export const todayISO = (tz = TZ) => {
  const p = partsIn(new Date(), tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
};

/** Suma días a una fecha "AAAA-MM-DD" (sin tocar la hora). */
export const addDaysISO = (iso: string, days: number) => {
  const { year, month, day } = parseISODate(iso);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().slice(0, 10);
};

/** Día de la semana (0 domingo … 6 sábado) de una fecha en la zona. */
export const weekdayOf = (iso: string) => {
  const { year, month, day } = parseISODate(iso);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export const formatTime = (date: Date, tz = TZ) =>
  new Intl.DateTimeFormat("es-MX", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);

export const formatDateLong = (date: Date, tz = TZ) =>
  new Intl.DateTimeFormat("es-MX", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);

export const formatDateTimeLong = (date: Date, tz = TZ) =>
  `${formatDateLong(date, tz)}, ${formatTime(date, tz)} h`;

// ---------------------------------------------------------------------------
// Disponibilidad
// ---------------------------------------------------------------------------

export type Slot = { start: string; end: string; label: string };
export type DayAvailability = { date: string; slots: Slot[] };

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Genera los horarios teóricos de un día según las reglas semanales. */
const slotsFromRules = (dateISO: string, rules: AvailabilityRule[]) => {
  const weekday = weekdayOf(dateISO);
  const { year, month, day } = parseISODate(dateISO);
  const out: { start: Date; end: Date }[] = [];

  for (const rule of rules) {
    if (!rule.activo || rule.weekday !== weekday) continue;
    const from = minutesOf(rule.hora_inicio);
    const to = minutesOf(rule.hora_fin);
    for (let m = from; m + SLOT_MINUTES <= to; m += SLOT_MINUTES) {
      const start = zonedToUtc(year, month, day, Math.floor(m / 60), m % 60);
      out.push({ start, end: new Date(start.getTime() + SLOT_MINUTES * 60_000) });
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
};

/**
 * Horarios libres de un rango de días: quita los pasados (según la anticipación
 * mínima), los bloqueados y los ya ocupados por citas pagadas o retenidas.
 */
export const getAvailability = async (fromISO: string, days: number): Promise<DayAvailability[]> => {
  const supabase = db();
  const toISO = addDaysISO(fromISO, days);
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  const rangeStart = zonedToUtc(from.year, from.month, from.day, 0, 0);
  const rangeEnd = zonedToUtc(to.year, to.month, to.day, 23, 59);

  const [rulesRes, blocksRes, busyRes] = await Promise.all([
    supabase.from("availability_rules").select("*").eq("activo", true),
    supabase.from("availability_blocks").select("*").lt("inicio", rangeEnd.toISOString()).gt("fin", rangeStart.toISOString()),
    supabase.rpc("horarios_ocupados", { p_desde: rangeStart.toISOString(), p_hasta: rangeEnd.toISOString() }),
  ]);

  if (rulesRes.error) throw rulesRes.error;
  if (blocksRes.error) throw blocksRes.error;
  if (busyRes.error) throw busyRes.error;

  const rules = (rulesRes.data ?? []) as AvailabilityRule[];
  const blocks = (blocksRes.data ?? []) as AvailabilityBlock[];
  const busy = new Set(((busyRes.data ?? []) as { slot_start: string }[]).map((r) => new Date(r.slot_start).getTime()));
  const minStart = Date.now() + LEAD_MINUTES * 60_000;

  const result: DayAvailability[] = [];
  for (let i = 0; i < days; i++) {
    const dateISO = addDaysISO(fromISO, i);
    const slots = slotsFromRules(dateISO, rules)
      .filter((s) => s.start.getTime() >= minStart)
      .filter((s) => !busy.has(s.start.getTime()))
      .filter((s) => !blocks.some((b) => new Date(b.inicio) < s.end && new Date(b.fin) > s.start))
      .map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString(), label: formatTime(s.start) }));
    result.push({ date: dateISO, slots });
  }
  return result;
};

/** Comprueba que un horario concreto sigue siendo ofertable (antes de cobrar). */
export const isSlotOffered = async (startISO: string) => {
  const start = new Date(startISO);
  if (Number.isNaN(start.getTime())) return false;
  if (start.getTime() < Date.now() + LEAD_MINUTES * 60_000) return false;
  const dateISO = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(start);
  const [day] = await getAvailability(dateISO, 1);
  return day.slots.some((s) => new Date(s.start).getTime() === start.getTime());
};

/** Folio corto y legible para el cliente: VER-8F3K2Q */
export const nuevoFolio = () => {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `VER-${s}`;
};
