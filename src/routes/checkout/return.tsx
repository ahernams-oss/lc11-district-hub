import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Doação — Distrito LC-11" }],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <>
      <PageHero
        eyebrow="Doação"
        title={sessionId ? "Obrigado pela sua contribuição!" : "Status da doação"}
        description={sessionId
          ? "Sua doação foi processada com sucesso. Agradecemos seu apoio aos projetos do Distrito LC-11."
          : "Não foi possível confirmar o status da sua doação."}
      />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        {sessionId ? (
          <div className="space-y-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <p className="text-muted-foreground">
              Sua transação foi registrada. Você receberá um comprovante por e-mail em breve.
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-gold px-6 py-3 font-display font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02]"
            >
              Voltar ao início
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
            <p className="text-muted-foreground">
              Se você acabou de fazer uma doação, entre em contato com a tesouraria distrital para confirmar.
            </p>
            <Link
              to="/doar"
              className="inline-block rounded-lg bg-gold px-6 py-3 font-display font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02]"
            >
              Tentar novamente
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
