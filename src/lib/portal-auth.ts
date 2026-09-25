import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { PORTAL_COOKIE } from "./portal-auth-shared";

// Sesión del portal del cliente.
//
// El cliente entra con su teléfono y el folio que recibió al pagar. Son dos
// datos que él tiene y un extraño no: el folio da 32^6 ≈ 1.07 mil millones de
// combinaciones y además hay que acertar el teléfono del titular.
//
// El secreto es PROPIO y no se cae al del panel: un token del portal no debe
// poder verificarse como token del panel ni al revés. Por eso también lleva
// `aud`, que jwtVerify comprueba.

const AUD = "veritum-portal";

/** Dos horas: entrar al portal es un trámite, no una jornada de trabajo. */
export const PORTAL_TTL_MIN = 120;

const secreto = () => process.env.PORTAL_SESSION_SECRET?.trim();

export const portalConfigurado = () => Boolean(secreto());

const key = () => new TextEncoder().encode(secreto() ?? "");

export type SesionPortal = {
  /** Id de la cita con la que entró. */
  aid: string;
  /** Teléfono normalizado: es lo que liga los documentos al cliente. */
  tel: string;
  folio: string;
};

export const crearSesionPortal = async (s: SesionPortal) => {
  const token = await new SignJWT({ aid: s.aid, tel: s.tel, folio: s.folio })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUD)
    .setIssuedAt()
    .setExpirationTime(`${PORTAL_TTL_MIN}m`)
    .sign(key());

  (await cookies()).set(PORTAL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Ámbito "/" y no "/portal" porque la descarga vive en /api/portal/...
    // Se compensa con el `aud` y con el plazo corto.
    path: "/",
    maxAge: PORTAL_TTL_MIN * 60,
  });
};

export const destruirSesionPortal = async () => {
  (await cookies()).delete(PORTAL_COOKIE);
};

/** Verifica de verdad la firma (el proxy solo mira si la cookie existe). */
export const getSesionPortal = async (): Promise<SesionPortal | null> => {
  if (!portalConfigurado()) return null;
  const token = (await cookies()).get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { audience: AUD });
    const { aid, tel, folio } = payload as Record<string, unknown>;
    if (typeof aid !== "string" || typeof tel !== "string" || typeof folio !== "string") return null;
    if (!/^[0-9]{10}$/.test(tel)) return null;
    return { aid, tel, folio };
  } catch {
    return null;
  }
};

// --- Límite de intentos ----------------------------------------------------
//
// Vive en la memoria del proceso: se reinicia en cada despliegue y es por
// réplica. Por eso, además del límite por IP, hay un freno global: si alguien
// reparte el ataque entre muchas IP, el portal se cierra para todos un rato.

const intentos = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

const fallosGlobales: number[] = [];
const VENTANA_GLOBAL_MS = 10 * 60 * 1000;
const MAX_GLOBAL = 60;

export const portalBloqueado = (ip: string) => {
  const reg = intentos.get(ip);
  return Boolean(reg && reg.n >= MAX_INTENTOS && Date.now() < reg.hasta);
};

/** Freno general ante un ataque repartido entre muchas direcciones. */
export const portalFrenoGlobal = () => {
  const ahora = Date.now();
  while (fallosGlobales.length > 0 && ahora - fallosGlobales[0] > VENTANA_GLOBAL_MS) fallosGlobales.shift();
  return fallosGlobales.length >= MAX_GLOBAL;
};

export const portalRegistrarFallo = (ip: string) => {
  const reg = intentos.get(ip) ?? { n: 0, hasta: 0 };
  const vigente = Date.now() < reg.hasta ? reg.n : 0;
  intentos.set(ip, { n: vigente + 1, hasta: Date.now() + BLOQUEO_MS });
  fallosGlobales.push(Date.now());
};

export const portalLimpiar = (ip: string) => intentos.delete(ip);
