import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult =
  | { clientSecret: string }
  | { error: string };

export const createDonationCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: {
    amountInCents: number;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!data.amountInCents || data.amountInCents < 50) {
      throw new Error("Amount must be at least 50 cents");
    }
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: { name: "Doação — Distrito LC-11" },
            unit_amount: data.amountInCents,
          },
          quantity: 1,
        }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        payment_intent_data: { description: "Doação — Distrito LC-11" },
        automatic_tax: { enabled: true },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
