import { test } from "node:test";
import assert from "node:assert/strict";
import { donationAmountInCents, isValidDonationAmount, isPaymentConfirmed } from "./donation-flow";

test("donation amounts accept Brazilian decimals without silently truncating input", () => {
  assert.equal(donationAmountInCents("25,50"), 2550);
  assert.equal(donationAmountInCents("25.50"), 2550);
  assert.equal(donationAmountInCents("25abc"), 0);
  assert.equal(donationAmountInCents("NaN"), 0);
});
test("the existing minimum donation remains R$ 5,00 with whole cents", () => {
  assert.equal(isValidDonationAmount(500), true);
  assert.equal(isValidDonationAmount(499), false);
  assert.equal(isValidDonationAmount(NaN), false);
  assert.equal(isValidDonationAmount(500.5), false);
});
test("only confirmed payments permit a donation receipt", () => {
  assert.equal(isPaymentConfirmed("paid"), true);
  assert.equal(isPaymentConfirmed("no_payment_required"), true);
  assert.equal(isPaymentConfirmed("unpaid"), false);
  assert.equal(isPaymentConfirmed("unknown"), false);
});