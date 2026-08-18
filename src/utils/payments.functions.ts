import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CheckoutSessionResult = { clientSecret: string } | { error: string };

export type DonationKind = "doacao_unica" | "campanha" | "apoio_mensal" | "inscricao_evento";

/** Doação avulsa (valor livre) ou doação vinculada a uma campanha específica. */
export const createDonationCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: {
    amountInCents: number;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
    campanhaId?: string;
    campanhaTitulo?: string;
  }) => {
    if (!data.amountInCents || data.amountInCents < 500) {
      throw new Error("O valor mínimo da doação é R$ 5,00");
    }
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const isCampanha = Boolean(data.campanhaId);
      const label = isCampanha
        ? `Doação — ${data.campanhaTitulo ?? "Campanha"}`
        : "Doação — Distrito LC-11";

      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: { name: label },
            unit_amount: data.amountInCents,
          },
          quantity: 1,
        }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        payment_intent_data: {
          description: label,
          ...(data.customerEmail && { receipt_email: data.customerEmail }),
        },
        automatic_tax: { enabled: true },
        metadata: {
          kind: isCampanha ? "campanha" : "doacao_unica",
          description: label,
          ...(data.campanhaId && { reference_id: data.campanhaId }),
          ...(data.campanhaTitulo && { reference_label: data.campanhaTitulo }),
        },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Apoio mensal recorrente (assinatura) usando os preços cadastrados. */
export const createSubscriptionCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: {
    priceId: string;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(data.priceId)) throw new Error("Plano inválido");
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      if (!prices.data.length) throw new Error("Plano de apoio não encontrado");
      const price = prices.data[0];

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        automatic_tax: { enabled: true },
        metadata: { kind: "apoio_mensal", description: "Apoio Mensal — Distrito LC-11" },
        subscription_data: {
          metadata: { kind: "apoio_mensal", price_lookup_key: data.priceId },
        },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Inscrição paga em evento. O valor vem sempre do banco, nunca do cliente. */
export const createEventRegistrationCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: {
    eventId: string;
    quantidade?: number;
    nome?: string;
    clube?: string;
    telefone?: string;
    customerEmail?: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!data.eventId) throw new Error("Evento inválido");
    const q = data.quantidade ?? 1;
    if (!Number.isInteger(q) || q < 1 || q > 20) throw new Error("Quantidade inválida");
    return { ...data, quantidade: q };
  })
  .handler(async ({ data }): Promise<CheckoutSessionResult> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: evento, error } = await supabaseAdmin
        .from("events")
        .select("id, title, inscricao_valor_cents, inscricao_ativa")
        .eq("id", data.eventId)
        .maybeSingle();

      if (error || !evento) throw new Error("Evento não encontrado");
      if (!evento.inscricao_ativa) throw new Error("As inscrições para este evento estão encerradas");
      const valor = Number(evento.inscricao_valor_cents ?? 0);
      if (valor < 500) throw new Error("Este evento não possui valor de inscrição configurado");

      const stripe = createStripeClient(data.environment);
      const label = `Inscrição — ${evento.title}`;

      const session = await stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: { name: label },
            unit_amount: valor,
          },
          quantity: data.quantidade,
        }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        payment_intent_data: {
          description: label,
          ...(data.customerEmail && { receipt_email: data.customerEmail }),
        },
        automatic_tax: { enabled: true },
        metadata: {
          kind: "inscricao_evento",
          description: label,
          reference_id: evento.id,
          reference_label: evento.title,
          quantidade: String(data.quantidade),
          ...(data.nome && { participante_nome: data.nome }),
          ...(data.clube && { participante_clube: data.clube }),
          ...(data.telefone && { participante_telefone: data.telefone }),
        },
        ...(data.customerEmail && { customer_email: data.customerEmail }),
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Portal do apoiador: alterar valor, atualizar cartão ou cancelar o apoio mensal. */
export const createSupporterPortalSession = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; returnUrl: string; environment: StripeEnv }) => {
    if (!data.email || !data.email.includes("@")) throw new Error("Informe um e-mail válido");
    return data;
  })
  .handler(async ({ data }): Promise<{ url: string } | { error: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const customers = await stripe.customers.list({ email: data.email, limit: 1 });
      if (!customers.data.length) {
        return { error: "Não encontramos nenhum apoio mensal com este e-mail." };
      }
      const portal = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: data.returnUrl,
      });
      return { url: portal.url };
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
          description: session.metadata?.description ?? "Doação — Distrito LC-11",
          receiptNumber: session.id.replace(/^cs_(test|live)_/, "").slice(0, 12).toUpperCase(),
          paymentIntentId: pi?.id ?? (typeof session.payment_intent === "string" ? session.payment_intent : null),
        },
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
