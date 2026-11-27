import { test } from "node:test";
import assert from "node:assert/strict";
import { STRIPE_PAYMENTS_PAUSED, checkoutPauseError } from "./payments-status";

test("Stripe is temporarily paused and rejects new checkout sessions", () => {
  assert.equal(STRIPE_PAYMENTS_PAUSED, true);
  assert.deepEqual(checkoutPauseError(), {
    error: "Novos pagamentos pelo Stripe estão temporariamente suspensos.",
  });
});