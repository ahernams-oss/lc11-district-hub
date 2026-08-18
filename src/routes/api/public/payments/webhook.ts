import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function getAdmin(): Promise<AdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function receiptNumberFor(sessionId: string) {
  return sessionId.replace(/^cs_(test|live)_/, "").slice(0, 12).toUpperCase();
}

/** Espelha o recebimento no módulo financeiro (Contas a Receber). */
async function registrarContaRecebida(
  admin: AdminClient,
  args: { descricao: string; valorCents: number; pagador: string | null; documento: string },
) {
  const hoje = new Date();
  const { error } = await admin.from("fin_contas_receber").upsert(
    {
      descricao: args.descricao,
      valor: args.valorCents,
      vencimento: hoje.toISOString().slice(0, 10),
      competencia: hoje.toISOString().slice(0, 7),
      status: "recebido",
      recebido_em: hoje.toISOString(),
      valor_recebido: args.valorCents,
      pagador: args.pagador,
      documento: args.documento,
      observacoes: "Lançamento automático — pagamento online (Stripe)",
    },
    { onConflict: "documento", ignoreDuplicates: true },
  );
  if (error) console.error("Falha ao lançar em contas a receber:", error);
}

async function persistDonation(session: any, env: StripeEnv) {
  if (!session?.id) return;
  const admin = await getAdmin();

  const sessionId: string = session.id;
  const receiptNumber = receiptNumberFor(sessionId);
  const kind: string = session.metadata?.kind ?? "doacao_unica";
  const amount: number = session.amount_total ?? 0;
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const nome = session.customer_details?.name ?? session.metadata?.participante_nome ?? null;
  const descricao = session.metadata?.description ?? "Doação — Distrito LC-11";

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { error } = await admin.from("donations").upsert(
    {
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id:
        typeof session.subscription === "string" ? session.subscription : null,
      amount,
      currency: (session.currency ?? "brl").toUpperCase(),
      payment_status: session.payment_status ?? "unknown",
      status: session.status ?? "unknown",
      customer_email: email,
      customer_name: nome,
      description: descricao,
      kind,
      reference_id: session.metadata?.reference_id ?? null,
      reference_label: session.metadata?.reference_label ?? null,
      receipt_number: receiptNumber,
      environment: env,
      raw_event: session,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_session_id" },
  );
  if (error) {
    console.error("Falha ao registrar a doação:", error);
    throw error;
  }

  const pago = session.payment_status === "paid" || session.payment_status === "no_payment_required";

  if (pago && kind === "inscricao_evento") {
    const { error: inscErr } = await admin.from("event_inscricoes").upsert(
      {
        event_id: session.metadata?.reference_id ?? null,
        event_titulo: session.metadata?.reference_label ?? "Evento",
        nome,
        email,
        telefone: session.metadata?.participante_telefone ?? null,
        clube: session.metadata?.participante_clube ?? null,
        valor_cents: amount,
        quantidade: Number(session.metadata?.quantidade ?? 1),
        stripe_session_id: sessionId,
        payment_status: session.payment_status ?? "paid",
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_session_id" },
    );
    if (inscErr) console.error("Falha ao registrar inscrição:", inscErr);
  }

  if (pago && env === "live") {
    await registrarContaRecebida(admin, {
      descricao,
      valorCents: amount,
      pagador: nome ?? email,
      documento: `STRIPE-${receiptNumber}`,
    });
  }
}

async function upsertSubscription(sub: any, env: StripeEnv) {
  const admin = await getAdmin();
  const item = sub.items?.data?.[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end;

  const { error } = await admin.from("donation_subscriptions").upsert(
    {
      stripe_subscription_id: sub.id,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
      price_id: item?.price?.lookup_key ?? item?.price?.id ?? null,
      amount_cents: item?.price?.unit_amount ?? 0,
      currency: (item?.price?.currency ?? "brl").toUpperCase(),
      status: sub.status ?? "active",
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) console.error("Falha ao registrar apoio mensal:", error);
}

async function registrarRenovacao(invoice: any, env: StripeEnv) {
  if (env !== "live") return;
  if (!invoice?.subscription || (invoice.amount_paid ?? 0) <= 0) return;
  const admin = await getAdmin();
  await registrarContaRecebida(admin, {
    descricao: "Apoio Mensal — Distrito LC-11",
    valorCents: invoice.amount_paid,
    pagador: invoice.customer_name ?? invoice.customer_email ?? null,
    documento: `STRIPE-INV-${String(invoice.id).slice(-12).toUpperCase()}`,
  });
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
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
              await upsertSubscription(event.data.object, env);
              break;
            case "invoice.paid":
              await registrarRenovacao(event.data.object, env);
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
