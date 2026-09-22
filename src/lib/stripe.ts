import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export const stripeReady = () => Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = () => {
  if (!stripeReady()) throw new Error("Stripe no está configurado: define STRIPE_SECRET_KEY.");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
  return client;
};
