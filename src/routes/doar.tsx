import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

export const Route = createFileRoute("/doar")({
  head: () => ({
    meta: [
      { title: "Doar — Distrito LC-11" },
      { name: "description", content: "Apoie os projetos do Distrito LC-11 com sua doação. Cada contribuição transforma vidas." },
      { property: "og:title", content: "Doar — Distrito LC-11" },
      { property: "og:description", content: "Apoie nossos projetos com sua doação." },
      { property: "og:url", content: "/doar" },
    ],
    links: [{ rel: "canonical", href: "/doar" }],
  }),
  component: Doar,
});

const valores = [50, 100, 250, 500];

function Doar() {
  const [valor, setValor] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const amountInCents = custom
    ? Math.round(parseFloat(custom) * 100)
    : (valor ?? 0) * 100;

  return (
    <>
      <PageHero
        eyebrow="Apoie nossa causa"
        title="Sua doação alimenta o serviço."
        description="100% do que arrecadamos é direcionado aos projetos do Distrito LC-11 e da Fundação Lions Clubs International (LCIF)."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Heart className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-lg font-bold">Impacto direto</h3>
              <p className="mt-2 text-sm text-muted-foreground">Cada doação financia ações concretas em visão, fome, meio ambiente, diabetes e câncer infantil.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <ShieldCheck className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-lg font-bold">Transparência</h3>
              <p className="mt-2 text-sm text-muted-foreground">Prestamos contas anualmente em assembleia distrital, com relatórios públicos detalhados.</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Sparkles className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-lg font-bold">Reconhecimento</h3>
              <p className="mt-2 text-sm text-muted-foreground">Doações elegíveis recebem reconhecimento pela Fundação LCIF (Melvin Jones Fellow).</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            {!checkoutOpen ? (
              <>
                <h2 className="font-display text-2xl font-bold">Escolha o valor da sua doação</h2>
                <p className="mt-2 text-sm opacity-90">Apoie com o valor que fizer sentido para você.</p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {valores.map((v) => (
                    <button
                      key={v}
                      onClick={() => { setValor(v); setCustom(""); }}
                      className={`rounded-lg border-2 px-3 py-3 font-display text-lg font-bold transition-all ${
                        valor === v ? "border-gold bg-gold text-gold-foreground" : "border-white/30 hover:border-gold"
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-80">Outro valor</label>
                  <div className="mt-2 flex items-center rounded-lg border-2 border-white/30 bg-white/5 px-3 focus-within:border-gold">
                    <span className="font-semibold">R$</span>
                    <input
                      type="number"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setValor(null); }}
                      placeholder="0,00"
                      className="w-full bg-transparent px-2 py-3 text-lg outline-none placeholder:text-white/50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (amountInCents >= 50) setCheckoutOpen(true);
                  }}
                  disabled={amountInCents < 50}
                  className="mt-6 w-full rounded-lg bg-gold py-3.5 font-display text-lg font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Doar R$ {custom || valor || 0}
                </button>

                <p className="mt-4 text-center text-xs opacity-80">
                  Ou faça uma transferência via PIX (CNPJ): <strong className="font-mono">27.784.685/0001-60</strong>
                </p>

              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold">Finalizar doação</h2>
                <p className="mt-2 text-sm opacity-90">Preencha seus dados abaixo de forma segura.</p>
                <div className="mt-6">
                  <StripeEmbeddedCheckout
                    amountInCents={amountInCents}
                    returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
                  />
                </div>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="mt-4 text-sm underline opacity-80 hover:opacity-100"
                >
                  Voltar e escolher outro valor
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
