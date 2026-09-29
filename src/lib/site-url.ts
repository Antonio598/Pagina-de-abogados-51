import "server-only";
import { headers } from "next/headers";

// Dirección pública del sitio.
//
// POR QUÉ NO BASTA LA VARIABLE DE ENTORNO. `NEXT_PUBLIC_SITE_URL` se congela en
// el build, así que si EasyPanel no la pasa como *argumento de build* (no solo
// como variable de entorno), en la imagen desplegada queda vacía. Con el valor
// por omisión anterior, Stripe recibía `http://localhost:3000` como dirección de
// regreso y mandaba al comprador a localhost después de pagar.
//
// Ahora, cuando la variable falta, se deduce del `Host` de la petición, que es el
// dominio público por el que entró el visitante. Falla de pie en vez de romperse.

const limpiar = (u: string) => u.trim().replace(/\/+$/, "");

const deEntorno = () => {
  const v = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return v ? limpiar(v) : undefined;
};

/** Deduce el origen a partir de las cabeceras de la petición. */
const deCabeceras = (h: Headers): string | undefined => {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return undefined;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return limpiar(`${proto}://${host}`);
};

/**
 * Para rutas de API y componentes de servidor. Prefiere la variable de entorno
 * —que es la verdad cuando está bien puesta— y si no, el dominio de la petición.
 */
export const siteUrlDesde = (h: Headers): string => deEntorno() ?? deCabeceras(h) ?? "http://localhost:3000";

/** Igual, pero leyendo las cabeceras por su cuenta. */
export const siteUrl = async (): Promise<string> => siteUrlDesde(await headers());

/** De dónde salió la dirección, para poder mostrarlo en el panel. */
export const siteUrlOrigen = (h: Headers): "variable de entorno" | "dominio de la petición" | "valor de reserva" =>
  deEntorno() ? "variable de entorno" : deCabeceras(h) ? "dominio de la petición" : "valor de reserva";
