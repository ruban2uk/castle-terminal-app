import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export default stripe;

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}
