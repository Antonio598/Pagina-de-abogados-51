import "server-only";
import { scrypt as scryptCb, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { PANEL_COOKIE } from "./panel-auth-shared";

// Acceso al panel: un único usuario maestro. La contraseña nunca se guarda en
// claro: en las variables va su hash scrypt (genera el tuyo con
// `node scripts/hash-password.mjs "tu contraseña"`).

const scrypt = promisify(scryptCb) as (p: string, s: Buffer, l: number) => Promise<Buffer>;

export const SESSION_HOURS = 8;

export const panelConfigurado = () => Boolean(process.env.PANEL_USER && process.env.PANEL_PASSWORD_HASH && sessionSecret());

const sessionSecret = () => process.env.PANEL_SESSION_SECRET?.trim();

const key = () => new TextEncoder().encode(sessionSecret() ?? "");

/** "sal:hash" en hexadecimal. */
export const hashPassword = async (password: string, salt = randomBytes(16)) => {
  const derived = await scrypt(password.normalize("NFKC"), salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const derived = await scrypt(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), 64);
    const expected = Buffer.from(hashHex, "hex");
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
};

export const createSession = async (usuario: string) => {
  const token = await new SignJWT({ u: usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());

  (await cookies()).set(PANEL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
};

export const destroySession = async () => {
  (await cookies()).delete(PANEL_COOKIE);
};

/** Verifica de verdad la firma de la sesión (el proxy solo mira si hay cookie). */
export const getSession = async (): Promise<{ usuario: string } | null> => {
  if (!panelConfigurado()) return null;
  const token = (await cookies()).get(PANEL_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return typeof payload.u === "string" ? { usuario: payload.u } : null;
  } catch {
    return null;
  }
};

// --- Límite de intentos de acceso (memoria del proceso) --------------------
const intentos = new Map<string, { n: number; hasta: number }>();
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;

export const bloqueado = (ip: string) => {
  const reg = intentos.get(ip);
  return Boolean(reg && reg.n >= MAX_INTENTOS && Date.now() < reg.hasta);
};

export const registrarFallo = (ip: string) => {
  const reg = intentos.get(ip) ?? { n: 0, hasta: 0 };
  const vigente = Date.now() < reg.hasta ? reg.n : 0;
  intentos.set(ip, { n: vigente + 1, hasta: Date.now() + BLOQUEO_MS });
};

export const limpiarIntentos = (ip: string) => intentos.delete(ip);
