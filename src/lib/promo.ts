// Precio de lanzamiento por tiempo limitado, decidido en el SERVIDOR.
//
// Regla honesta: el reloj empieza en la primera visita a la landing, se guarda
// firmado en una cookie httpOnly, y cuando expira el precio sube DE VERDAD —
// Stripe cobra el id de precio normal. El contador no es decoración.
//
// Aplica a un solo servicio (el prioritario) y a un solo importe, los dos
// definidos en content/productos.ts.
//
// Este módulo usa Web Crypto para poder ejecutarse también en `proxy.ts`.

import { promocion } from "@content/productos";

export const PROMO_COOKIE = "veritum_promo";

/** Minutos que dura la oferta desde la primera visita. */
export const promoMinutes = promocion.minutos;

const enc = new TextEncoder();

const keyFor = async (secret: string) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const secret = () => process.env.PANEL_SESSION_SECRET?.trim() || "";

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
  // Una cookie del futuro no vale: alguien intentando alargar la ventana.
  if (startMs > Date.now() + 60_000) return null;
  const s = secret();
  if (!s) return startMs;
  if (!sig) return null;
  const expected = await crypto.subtle.sign("HMAC", await keyFor(s), enc.encode(raw));
  return toHex(expected) === sig ? startMs : null;
};

export type PromoState = {
  /** La promoción está configurada (hay id de precio en Stripe). */
  enabled: boolean;
  /** Sigue vigente para este visitante. */
  active: boolean;
  /** Fin en milisegundos, para el contador. */
  endsAt: number | null;
  /** Milisegundos restantes, ya calculados en el servidor. */
  restanteMs: number | null;
};

export const promoStateFrom = (startMs: number | null, enabled: boolean): PromoState => {
  if (!enabled) return { enabled: false, active: false, endsAt: null, restanteMs: null };
  // Sin cookie todavía (primera visita, antes de que el proxy la ponga): la
  // ventana completa está por delante.
  if (startMs === null) {
    const endsAt = Date.now() + promoMinutes * 60_000;
    return { enabled: true, active: true, endsAt, restanteMs: promoMinutes * 60_000 };
  }
  const endsAt = startMs + promoMinutes * 60_000;
  const restanteMs = endsAt - Date.now();
  return { enabled: true, active: restanteMs > 0, endsAt, restanteMs: Math.max(0, restanteMs) };
};
