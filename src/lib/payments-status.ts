// Temporary switch shared by checkout entry points and server handlers.
export const STRIPE_PAYMENTS_PAUSED = true;
export const STRIPE_PAUSE_MESSAGE = "Novos pagamentos pelo Stripe estão temporariamente suspensos.";

export function checkoutPauseError(): { error: string } | null {
  return STRIPE_PAYMENTS_PAUSED ? { error: STRIPE_PAUSE_MESSAGE } : null;
}