import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
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
  const fetchClientSecret = async (): Promise<string> => {
    const environment = getStripeEnvironment();
    const returnUrl = props.returnUrl || defaultReturnUrl();

    const result =
      props.tipo === "apoio_mensal"
        ? await createSubscriptionCheckout({
            data: {
              priceId: props.priceId,
              customerEmail: props.customerEmail,
              returnUrl,
              environment,
            },
          })
        : props.tipo === "inscricao_evento"
          ? await createEventRegistrationCheckout({
              data: {
                eventId: props.eventId,
                quantidade: props.quantidade,
                nome: props.nome,
                clube: props.clube,
                telefone: props.telefone,
                customerEmail: props.customerEmail,
                returnUrl,
                environment,
              },
            })
          : await createDonationCheckout({
              data: {
                amountInCents: props.amountInCents,
                campanhaId: props.campanhaId,
                campanhaTitulo: props.campanhaTitulo,
                customerEmail: props.customerEmail,
                returnUrl,
                environment,
              },
            });

    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe não retornou o client secret");
    return result.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
