import "server-only";
import { cookies } from "next/headers";
import { promocion } from "@content/productos";
import { PROMO_COOKIE, promoStateFrom, readPromo, type PromoState } from "./promo";

// Lectura del estado de la promoción desde un componente de servidor.
//
// La promoción solo existe si hay un id de precio de Stripe para ella: sin ese
// id no se podría cobrar el importe promocional, así que tampoco se anuncia.
// Falla cerrado a propósito.

export const promoConfigurada = () => Boolean(process.env[promocion.stripePriceEnv]?.trim());

export const getPromo = async (): Promise<PromoState> => {
  const inicio = await readPromo((await cookies()).get(PROMO_COOKIE)?.value);
  return promoStateFrom(inicio, promoConfigurada());
};

/**
 * ¿Este servicio se COBRA al precio de promoción ahora mismo?
 *
 * Es más estricto que getPromo() a propósito, y la diferencia importa:
 * getPromo() sirve para PINTAR, y ahí una primera visita sin cookie todavía
 * muestra la ventana completa. Para COBRAR se exige una cookie que exista y
 * cuya firma cuadre. Sin eso no hay descuento.
 *
 * Si no se distinguieran, una cookie falsificada se rechazaría por la firma,
 * quedaría como "sin cookie" y se leería como primera visita: descuento gratis
 * para quien sepa fabricar una.
 */
export const promoAplicaA = async (productoId: string | null | undefined): Promise<boolean> => {
  if (productoId !== promocion.productoId) return false;
  if (!promoConfigurada()) return false;

  const inicio = await readPromo((await cookies()).get(PROMO_COOKIE)?.value);
  // Sin inicio verificable no hay promoción: falla cerrado.
  if (inicio === null) return false;
  return Date.now() < inicio + promocion.minutos * 60_000;
};
