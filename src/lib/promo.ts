// Promoción por tiempo limitado, decidida en el SERVIDOR.
//
// Regla honesta: el reloj empieza en la primera visita a la landing, se guarda
// firmado en una cookie httpOnly (el visitante no puede alargarlo ni reiniciarlo
// borrando el navegador sin perder también el descuento) y, cuando expira, el
// precio sube de verdad: Stripe cobra el precio normal. Si no hay precio
// promocional configurado, no hay contador ni descuento en ninguna parte.
//
// Este módulo usa Web Crypto para poder ejecutarse también en `proxy.ts`.

export const PROMO_COOKIE = "veritum_promo";

export const promoMinutes = Number(process.env.NEXT_PUBLIC_PROMO_MINUTOS ?? 10);

const enc = new TextEncoder();

const keyFor = async (secret: string) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const secret = () => process.env.PANEL_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/** Firma "<inicioMs>" → "<inicioMs>.<hmac>" */
export const signPromo = async (startMs: number) => {
  const s = secret();
  if (!s) return String(startMs);
  const sig = await crypto.subtle.sign("HMAC", await keyFor(s), enc.encode(String(startMs)));
  return `${startMs}.${toHex(sig)}`;
};

/** Devuelve el instante de inicio si la cookie es válida; si no, null. */
export const readPromo = async (value: string | undefined): Promise<number | null> => {
  if (!value) return null;
  const [raw, sig] = value.split(".");
  const startMs = Number(raw);
  if (!Number.isFinite(startMs) || startMs <= 0) return null;
  const s = secret();
  if (!s) return startMs;
  if (!sig) return null;
  const expected = await crypto.subtle.sign("HMAC", await keyFor(s), enc.encode(raw));
  return toHex(expected) === sig ? startMs : null;
};

export type PromoState = {
  /** Hay precio promocional configurado. */
  enabled: boolean;
  /** La promoción sigue vigente para este visitante. */
  active: boolean;
  /** Fin de la promoción en milisegundos (para el contador). */
  endsAt: number | null;
};

export const promoStateFrom = (startMs: number | null, enabled: boolean): PromoState => {
  if (!enabled) return { enabled: false, active: false, endsAt: null };
  if (startMs === null) return { enabled: true, active: true, endsAt: Date.now() + promoMinutes * 60_000 };
  const endsAt = startMs + promoMinutes * 60_000;
  return { enabled: true, active: Date.now() < endsAt, endsAt };
};
