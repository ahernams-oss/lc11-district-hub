import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
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

export type DonationReceipt = {
  sessionId: string;
  amount: number; // in cents
  currency: string;
  paymentStatus: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: number; // unix seconds
  description: string;
  receiptNumber: string;
  paymentIntentId: string | null;
};

type ReceiptResult = { receipt: DonationReceipt } | { error: string };

export const getDonationReceipt = createServerFn({ method: "GET" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!data.sessionId || typeof data.sessionId !== "string") {
      throw new Error("sessionId is required");
    }
    return data;
  })
  .handler(async ({ data }): Promise<ReceiptResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId, {
        expand: ["payment_intent", "customer_details"],
      });

      const pi = typeof session.payment_intent === "object" && session.payment_intent
        ? session.payment_intent
        : null;

      return {
        receipt: {
          sessionId: session.id,
          amount: session.amount_total ?? 0,
          currency: (session.currency ?? "brl").toUpperCase(),
          paymentStatus: session.payment_status ?? "unknown",
          status: session.status ?? "unknown",
          customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
          customerName: session.customer_details?.name ?? null,
          createdAt: session.created,
          description: "Doação — Distrito LC-11",
          receiptNumber: session.id.replace(/^cs_(test|live)_/, "").slice(0, 12).toUpperCase(),
          paymentIntentId: pi?.id ?? (typeof session.payment_intent === "string" ? session.payment_intent : null),
        },
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
