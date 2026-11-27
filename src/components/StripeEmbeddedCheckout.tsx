import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { STRIPE_PAYMENTS_PAUSED, STRIPE_PAUSE_MESSAGE } from "@/lib/payments-status";
import {
  createDonationCheckout,
  createEventRegistrationCheckout,
  createSubscriptionCheckout,
} from "@/utils/payments.functions";

type Common = {
  customerEmail?: string;
  returnUrl?: string;
};

export type CheckoutConfig =
  | ({ tipo: "doacao"; amountInCents: number; campanhaId?: string; campanhaTitulo?: string } & Common)
  | ({ tipo: "apoio_mensal"; priceId: string } & Common)
  | ({
      tipo: "inscricao_evento";
      eventId: string;
      quantidade?: number;
      nome?: string;
      clube?: string;
      telefone?: string;
    } & Common);

function defaultReturnUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
}

export function StripeEmbeddedCheckout(props: CheckoutConfig) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const serialized = JSON.stringify(props);

  useEffect(() => {
    if (STRIPE_PAYMENTS_PAUSED) return;
    let cancelled = false;
    setClientSecret(null);
    setError(null);
    const config: CheckoutConfig = JSON.parse(serialized);
    const prepare = async () => {
    const environment = getStripeEnvironment();
    const returnUrl = config.returnUrl || defaultReturnUrl();

    const result =
      config.tipo === "apoio_mensal"
        ? await createSubscriptionCheckout({
            data: {
              priceId: config.priceId,
              ...(config.customerEmail && { customerEmail: config.customerEmail }),
              returnUrl,
              environment,
            },
          })
        : config.tipo === "inscricao_evento"
          ? await createEventRegistrationCheckout({
              data: {
                eventId: config.eventId,
                ...(config.quantidade !== undefined && { quantidade: config.quantidade }),
                ...(config.nome && { nome: config.nome }),
                ...(config.clube && { clube: config.clube }),
                ...(config.telefone && { telefone: config.telefone }),
                ...(config.customerEmail && { customerEmail: config.customerEmail }),
                returnUrl,
                environment,
              },
            })
          : await createDonationCheckout({
              data: {
                amountInCents: config.amountInCents,
                ...(config.campanhaId && { campanhaId: config.campanhaId }),
                ...(config.campanhaTitulo && { campanhaTitulo: config.campanhaTitulo }),
                ...(config.customerEmail && { customerEmail: config.customerEmail }),
                returnUrl,
                environment,
              },
            });

    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe não retornou o client secret");
    if (!cancelled) setClientSecret(result.clientSecret);
    };
    void prepare().catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : "Pagamento indisponível");
    });
    return () => { cancelled = true; };
  }, [serialized, attempt]);

  if (STRIPE_PAYMENTS_PAUSED) return <p role="status" className="rounded-md bg-background p-6 text-foreground">{STRIPE_PAUSE_MESSAGE}</p>;

  if (error) return (
    <div role="alert" className="rounded-md bg-background p-6 text-center text-foreground">
      <p>Não foi possível abrir o pagamento. Nenhuma cobrança foi realizada nesta etapa.</p>
      {error.includes("stripe_tax_inactive") && <p className="mt-2 text-sm">A conta de pagamentos ainda precisa concluir sua configuração tributária.</p>}
      <details className="mt-3 text-left text-xs text-muted-foreground"><summary className="cursor-pointer">Detalhes do erro</summary><p className="mt-2 break-words">{error}</p></details>
      <Button className="mt-4" onClick={() => setAttempt((value) => value + 1)}><RefreshCw /> Tentar novamente</Button>
    </div>
  );
  if (!clientSecret) return <div role="status" className="flex min-h-48 items-center justify-center gap-3 rounded-md bg-background p-6 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Preparando pagamento seguro…</div>;

  return (
    <div id="checkout" className="overflow-hidden rounded-md bg-background text-foreground">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
