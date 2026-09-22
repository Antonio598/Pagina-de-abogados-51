import "server-only";
import { cookies } from "next/headers";
import { formatMoney, precioVigente, promoConfigurada } from "./pricing";
import { PROMO_COOKIE, promoStateFrom, readPromo, type PromoState } from "./promo";

/**
 * Estado de la promoción y precio vigente para esta visita, resuelto en el
 * servidor. La cookie la crea `proxy.ts` en la primera visita a la landing.
 */
export const getPromo = async (): Promise<{
  promo: PromoState & { restanteMs: number | null };
  precio: ReturnType<typeof precioVigente> & { etiqueta: string; etiquetaNormal: string };
}> => {
  const start = await readPromo((await cookies()).get(PROMO_COOKIE)?.value);
  const promo = promoStateFrom(start, promoConfigurada);
  const base = precioVigente(promo.active);
  return {
    promo: { ...promo, restanteMs: promo.active && promo.endsAt ? promo.endsAt - Date.now() : null },
    precio: {
      ...base,
      etiqueta: formatMoney(base.centavos, base.moneda),
      etiquetaNormal: formatMoney(base.normalCentavos, base.moneda),
    },
  };
};
