import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

async function persistDonation(session: any, env: StripeEnv) {
  if (!session?.id) return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const sessionId: string = session.id;
  const receiptNumber = sessionId.replace(/^cs_(test|live)_/, "").slice(0, 12).toUpperCase();

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const row = {
    stripe_session_id: sessionId,
    stripe_payment_intent_id: paymentIntentId,
    amount: session.amount_total ?? 0,
    currency: (session.currency ?? "brl").toUpperCase(),
    payment_status: session.payment_status ?? "unknown",
    status: session.status ?? "unknown",
    customer_email:
      session.customer_details?.email ?? session.customer_email ?? null,
    customer_name: session.customer_details?.name ?? null,
    description:
      session.metadata?.description ??
      session.payment_intent?.description ??
      "Doação — Distrito LC-11",
    receipt_number: receiptNumber,
    environment: env,
    raw_event: session,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("donations")
    .upsert(row, { onConflict: "stripe_session_id" });

  if (error) {
    console.error("Failed to persist donation:", error);
    throw error;
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;

        try {
          const event = await verifyWebhook(request, env);
          console.log("Stripe webhook event:", event.type);

          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
            case "checkout.session.async_payment_failed":
              await persistDonation(event.data.object, env);
              break;
            default:
              break;
          }

          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
