import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { getCampanhaBySlug } from "@/lib/campanhas";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PixQrCode } from "@/components/PixQrCode";

export const Route = createFileRoute("/campanhas/$slug")({
  head: () => ({
    meta: [
      { title: "Campanha — Distrito LC-11" },
      { name: "description", content: "Contribua com esta campanha de arrecadação do Distrito LC-11 e acompanhe o impacto gerado." },
      { property: "og:title", content: "Campanha — Distrito LC-11" },
      { property: "og:description", content: "Contribua com esta campanha do Distrito LC-11." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampanhaDetalhe,
});

const sugestoes = [50, 100, 250, 500];

function CampanhaDetalhe() {
  const { slug } = Route.useParams();
  const [valor, setValor] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const { data: campanha, isLoading } = useQuery({
    queryKey: ["campanha", slug],
    queryFn: () => getCampanhaBySlug(slug),
  });

  const amountInCents = custom
    ? Math.round(parseFloat(custom.replace(",", ".")) * 100)
    : (valor ?? 0) * 100;

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-24 text-muted-foreground">Carregando…</div>;
  }

  if (!campanha) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Campanha não encontrada</h1>
        <Link to="/campanhas" className="mt-4 inline-block text-sm underline">Ver todas as campanhas</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow="Campanha" title={campanha.titulo} description={campanha.descricao ?? ""} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            {campanha.imagem_url && (
              <img src={campanha.imagem_url} alt={campanha.titulo} className="w-full rounded-xl object-cover shadow-card" />
            )}
            {campanha.conteudo && (
              <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {campanha.conteudo}
              </div>
            )}
            {campanha.meta_cents > 0 && (
              <p className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
                Meta desta campanha:{" "}
                <strong>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(campanha.meta_cents / 100)}
                </strong>
              </p>
            )}
          </div>

          <div className="h-fit rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            {!checkoutAberto ? (
              <>
                <h2 className="font-display text-2xl font-bold">Contribuir agora</h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {sugestoes.map((v) => (
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
                <div className="mt-4 flex items-center rounded-lg border-2 border-white/30 bg-white/5 px-3 focus-within:border-gold">
                  <span className="font-semibold">R$</span>
                  <input
                    type="number"
                    value={custom}
                    onChange={(e) => { setCustom(e.target.value); setValor(null); }}
                    placeholder="Outro valor"
                    className="w-full bg-transparent px-2 py-3 text-lg outline-none placeholder:text-white/50"
                  />
                </div>
                <button
                  onClick={() => setCheckoutAberto(true)}
                  disabled={amountInCents < 500}
                  className="mt-6 w-full rounded-lg bg-gold py-3.5 font-display text-lg font-bold text-gold-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Doar
                </button>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold">Finalizar doação</h2>
                <div className="mt-6">
                  <StripeEmbeddedCheckout
                    tipo="doacao"
                    amountInCents={amountInCents}
                    campanhaId={campanha.id}
                    campanhaTitulo={campanha.titulo}
                  />
                </div>
                <button onClick={() => setCheckoutAberto(false)} className="mt-4 text-sm underline opacity-80">
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
