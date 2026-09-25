// Precios de los servicios de defensa laboral.
//
// Los importes viven en content/productos.ts, no en variables de entorno: una
// NEXT_PUBLIC_* se congela en el build y el Dockerfile no las declara todas como
// ARG, así que una variable ausente dejaba la landing sin precio y sin
// posibilidad de reservar. Ver el comentario de cabecera de content/productos.ts.
//
// De entorno solo quedan los ids de precio de Stripe, que son opcionales.

import { MONEDA, productoODefecto, type Producto } from "@content/productos";

export { MONEDA };

export const formatMoney = (centavos: number, moneda: string = MONEDA) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(
    centavos / 100,
  );

/**
 * Hay cobro disponible. Antes dependía de una variable de entorno; ahora los
 * importes son contenido versionado, así que el cobro está disponible siempre
 * que exista el catálogo. Se conserva como función para no cambiar los cuatro
 * lugares que la consultan.
 */
export const cobroDisponible = () => true;

/** Id de precio de Stripe del producto, si se configuró uno. */
export const stripePriceId = (producto: Producto): string | undefined =>
  process.env[producto.stripePriceEnv]?.trim() || undefined;

/**
 * Precio que se va a cobrar. Lo decide SIEMPRE el servidor a partir del id de
 * producto: cualquier importe que mande el navegador se ignora.
 */
export const precioDe = (productoId: string | undefined | null) => {
  const producto = productoODefecto(productoId);
  return {
    producto,
    centavos: producto.precioCentavos,
    moneda: MONEDA,
    etiqueta: formatMoney(producto.precioCentavos),
  };
};
