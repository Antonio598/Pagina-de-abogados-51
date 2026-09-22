// Precio de la asesoría inicial. Precio único para todas las áreas.
// Los importes se configuran en centavos por variable de entorno y deben
// coincidir con los precios creados en Stripe.

const cents = (v: string | undefined) => {
  const n = Number((v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
};

export const PRECIO_NORMAL = cents(process.env.NEXT_PUBLIC_PRECIO_NORMAL);
export const PRECIO_PROMO = cents(process.env.NEXT_PUBLIC_PRECIO_PROMO);
export const MONEDA = (process.env.NEXT_PUBLIC_MONEDA?.trim() || "MXN").toUpperCase();

/** Hay cobro configurado: sin esto, el flujo de reserva no se ofrece. */
export const cobroConfigurado = PRECIO_NORMAL !== undefined;

/** Hay promoción configurada (precio menor al normal). */
export const promoConfigurada =
  PRECIO_NORMAL !== undefined && PRECIO_PROMO !== undefined && PRECIO_PROMO < PRECIO_NORMAL;

export const formatMoney = (centavos: number, moneda = MONEDA) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(centavos / 100);

/** Precio vigente según si la promoción sigue activa para este visitante. */
export const precioVigente = (promoActiva: boolean) => {
  const usarPromo = promoConfigurada && promoActiva;
  return {
    centavos: (usarPromo ? PRECIO_PROMO : PRECIO_NORMAL) ?? 0,
    normalCentavos: PRECIO_NORMAL ?? 0,
    conDescuento: Boolean(usarPromo),
    ahorroCentavos: usarPromo ? (PRECIO_NORMAL ?? 0) - (PRECIO_PROMO ?? 0) : 0,
    moneda: MONEDA,
  };
};

/** Id del precio de Stripe correspondiente (servidor). */
export const stripePriceId = (conDescuento: boolean) =>
  (conDescuento ? process.env.STRIPE_PRICE_PROMO_ID : process.env.STRIPE_PRICE_ID)?.trim() || undefined;
