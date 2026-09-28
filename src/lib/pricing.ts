// Precios de los servicios de defensa laboral.
//
// Los importes viven en content/productos.ts, no en variables de entorno: una
// NEXT_PUBLIC_* se congela en el build y el Dockerfile no las declara todas como
// ARG, así que una variable ausente dejaba la landing sin precio. Ver el
// comentario de cabecera de content/productos.ts.
//
// De entorno solo salen los ids de precio de Stripe.

import { MONEDA, productoODefecto, promocion, type Producto } from "@content/productos";

export { MONEDA };

export const formatMoney = (centavos: number, moneda: string = MONEDA) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(
    centavos / 100,
  );

/**
 * Hay cobro disponible. Se conserva como función para no cambiar los lugares
 * que la consultan; los importes son contenido versionado, así que el cobro está
 * disponible siempre que exista el catálogo.
 */
export const cobroDisponible = () => true;

/** Id de precio de Stripe del servicio a precio normal. */
export const stripePriceId = (producto: Producto): string | undefined =>
  process.env[producto.stripePriceEnv]?.trim() || undefined;

/** Id de precio de Stripe del importe promocional. */
export const stripePricePromoId = (): string | undefined => process.env[promocion.stripePriceEnv]?.trim() || undefined;

/**
 * Precio que se va a cobrar. Lo decide SIEMPRE el servidor: el id de servicio y,
 * si la promoción está vigente, el importe promocional. Cualquier importe que
 * mande el navegador se ignora.
 *
 * `promoActiva` lo resuelve quien llama leyendo la cookie firmada (ver
 * src/lib/promo-server.ts): esta función no toca cookies para poder usarse
 * también desde sitios sin petición.
 */
export const precioDe = (productoId: string | undefined | null, promoActiva = false) => {
  const producto = productoODefecto(productoId);
  const conPromo = promoActiva && producto.id === promocion.productoId && Boolean(stripePricePromoId());
  const centavos = conPromo ? promocion.precioCentavos : producto.precioCentavos;

  return {
    producto,
    centavos,
    normalCentavos: producto.precioCentavos,
    conPromo,
    moneda: MONEDA,
    etiqueta: formatMoney(centavos),
    etiquetaNormal: formatMoney(producto.precioCentavos),
    /** Id de precio de Stripe que corresponde a este cobro. */
    priceId: conPromo ? stripePricePromoId() : stripePriceId(producto),
  };
};
