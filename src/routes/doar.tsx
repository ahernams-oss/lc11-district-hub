import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Heart, ShieldCheck, Sparkles, Repeat, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StripeEmbeddedCheckout, type CheckoutConfig } from "@/components/StripeEmbeddedCheckout";
import { PixQrCode } from "@/components/PixQrCode";
import { getStripeEnvironment } from "@/lib/stripe";
import { createSupporterPortalSession } from "@/utils/payments.functions";
import { listCampanhas } from "@/lib/campanhas";

export const Route = createFileRoute("/doar")({
  head: () => ({
    meta: [
      { title: "Doar — Distrito LC-11" },
      { name: "description", content: "Apoie os projetos do Distrito LC-11 com uma doação avulsa, um apoio mensal ou contribuindo com uma campanha específica." },
      { property: "og:title", content: "Doar — Distrito LC-11" },
      { property: "og:description", content: "Doação avulsa, apoio mensal ou campanhas específicas. Cada contribuição transforma vidas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/doar" },
    ],
    links: [{ rel: "canonical", href: "/doar" }],
  }),
  component: Doar,
});

const valores = [50, 100, 250, 500];
const planosMensais = [
  { priceId: "apoio_mensal_25", label: "R$ 25" },
  { priceId: "apoio_mensal_50", label: "R$ 50" },
  { priceId: "apoio_mensal_100", label: "R$ 100" },
  { priceId: "apoio_mensal_200", label: "R$ 200" },
];

type Aba = "unica" | "mensal" | "campanha";

function Doar() {
  const [aba, setAba] = useState<Aba>("unica");
  const [valor, setValor] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [plano, setPlano] = useState("apoio_mensal_50");
  const [campanhaId, setCampanhaId] = useState<string>("");
  const [checkout, setCheckout] = useState<CheckoutConfig | null>(null);
  const [portalEmail, setPortalEmail] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalErro, setPortalErro] = useState<string | null>(null);

  const { data: campanhas = [] } = useQuery({
    queryKey: ["campanhas-ativas"],
    queryFn: listCampanhas,
  });

  const amountInCents = custom
    ? Math.round(parseFloat(custom.replace(",", ".")) * 100)
    : (valor ?? 0) * 100;

  const campanhaSelecionada = campanhas.find((c) => c.id === campanhaId) ?? campanhas[0];

  const abrirPortal = async () => {
    setPortalErro(null);
    setPortalLoading(true);
    try {
      const result = await createSupporterPortalSession({
        data: {
          email: portalEmail,
          returnUrl: window.location.href,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setPortalErro(e instanceof Error ? e.message : "Não foi possível abrir o portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const abas: { id: Aba; label: string }[] = [
    { id: "unica", label: "Doação única" },
    { id: "mensal", label: "Apoio mensal" },
    { id: "campanha", label: "Campanhas" },
  ];

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
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Repeat className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-lg font-bold">Já é apoiador mensal?</h3>
              <p className="mt-2 text-sm text-muted-foreground">Altere o valor, atualize o cartão ou encerre seu apoio quando quiser.</p>
              <input
                type="email"
                value={portalEmail}
                onChange={(e) => setPortalEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={abrirPortal}
                disabled={portalLoading || !portalEmail}
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Gerenciar meu apoio
              </button>
              {portalErro && <p className="mt-2 text-xs text-destructive">{portalErro}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground shadow-elegant">
            {!checkout ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {abas.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAba(a.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        aba === a.id ? "bg-gold text-gold-foreground" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                {aba === "unica" && (
                  <>
                    <h2 className="mt-6 font-display text-2xl font-bold">Escolha o valor da sua doação</h2>
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
                      onClick={() => setCheckout({ tipo: "doacao", amountInCents })}
                      disabled={amountInCents < 500}
                      className="mt-6 w-full rounded-lg bg-gold py-3.5 font-display text-lg font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Doar R$ {custom || valor || 0}
                    </button>

                    <div className="mt-6">
                      <PixQrCode amountInCents={amountInCents} title="Prefere pagar com PIX?" />
                    </div>
                  </>
                )}

                {aba === "mensal" && (
                  <>
                    <h2 className="mt-6 font-display text-2xl font-bold">Torne-se apoiador mensal</h2>
                    <p className="mt-2 text-sm opacity-90">Uma contribuição recorrente dá previsibilidade aos nossos projetos. Cancele quando quiser.</p>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {planosMensais.map((p) => (
                        <button
                          key={p.priceId}
                          onClick={() => setPlano(p.priceId)}
                          className={`rounded-lg border-2 px-3 py-3 font-display text-lg font-bold transition-all ${
                            plano === p.priceId ? "border-gold bg-gold text-gold-foreground" : "border-white/30 hover:border-gold"
                          }`}
                        >
                          {p.label}
                          <span className="block text-xs font-normal opacity-80">/mês</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckout({ tipo: "apoio_mensal", priceId: plano })}
                      className="mt-6 w-full rounded-lg bg-gold py-3.5 font-display text-lg font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02]"
                    >
                      Apoiar mensalmente
                    </button>
                  </>
                )}

                {aba === "campanha" && (
                  <>
                    <h2 className="mt-6 font-display text-2xl font-bold">Doe para uma campanha</h2>
                    {campanhas.length === 0 ? (
                      <p className="mt-2 text-sm opacity-90">Nenhuma campanha ativa no momento. Sua doação única sempre ajuda!</p>
                    ) : (
                      <>
                        <p className="mt-2 text-sm opacity-90">Direcione sua contribuição para uma causa específica.</p>
                        <div className="mt-4 space-y-2">
                          {campanhas.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setCampanhaId(c.id)}
                              className={`w-full rounded-lg border-2 px-4 py-3 text-left transition-all ${
                                (campanhaSelecionada?.id === c.id) ? "border-gold bg-white/10" : "border-white/30 hover:border-gold"
                              }`}
                            >
                              <span className="font-display font-bold">{c.titulo}</span>
                              {c.descricao && <span className="block text-xs opacity-80">{c.descricao}</span>}
                            </button>
                          ))}
                        </div>

                        <div className="mt-4">
                          <label className="text-xs font-semibold uppercase tracking-wider opacity-80">Valor</label>
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
                          onClick={() =>
                            campanhaSelecionada &&
                            setCheckout({
                              tipo: "doacao",
                              amountInCents,
                              campanhaId: campanhaSelecionada.id,
                              campanhaTitulo: campanhaSelecionada.titulo,
                            })
                          }
                          disabled={amountInCents < 500 || !campanhaSelecionada}
                          className="mt-6 w-full rounded-lg bg-gold py-3.5 font-display text-lg font-bold text-gold-foreground shadow-card transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Doar para {campanhaSelecionada?.titulo ?? "a campanha"}
                        </button>
                        <Link to="/campanhas" className="mt-3 block text-center text-xs underline opacity-80 hover:opacity-100">
                          Ver todas as campanhas
                        </Link>
                      </>
                    )}
                  </>
                )}

                <p className="mt-4 text-center text-xs opacity-80">
                  Ou faça uma transferência via PIX (CNPJ): <strong className="font-mono">27.784.685/0001-60</strong>
                </p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold">Finalizar contribuição</h2>
                <p className="mt-2 text-sm opacity-90">Preencha seus dados abaixo de forma segura.</p>
                <div className="mt-6">
                  <StripeEmbeddedCheckout {...checkout} />
                </div>
                <button
                  onClick={() => setCheckout(null)}
                  className="mt-4 text-sm underline opacity-80 hover:opacity-100"
                >
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
