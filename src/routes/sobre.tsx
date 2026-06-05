import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Distrito — Distrito LC-11" },
      { name: "description", content: "Conheça a história, missão e estrutura do Distrito LC-11 do Lions Clubs International." },
      { property: "og:title", content: "Sobre o Distrito LC-11" },
      { property: "og:description", content: "História, missão e valores do Distrito LC-11." },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: Sobre,
});

const values = [
  { title: "Integridade", desc: "Agimos com honestidade e ética em tudo o que fazemos." },
  { title: "Compaixão", desc: "Servimos com empatia, escutando as necessidades reais da comunidade." },
  { title: "União", desc: "Somos mais fortes juntos — clubes, distritos e voluntários do mundo inteiro." },
  { title: "Excelência", desc: "Buscamos sempre o melhor impacto possível em cada projeto." },
];

function Sobre() {
  return (
    <>
      <PageHero
        eyebrow="Sobre nós"
        title="Servindo nossa comunidade há mais de um século."
        description="O Distrito LC-11 reúne dezenas de clubes Lions empenhados em transformar vidas por meio do serviço voluntário organizado."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="font-display text-3xl font-bold">Nossa história</h2>
          <p className="text-muted-foreground">
            Fundado como parte do Lions Clubs International — a maior organização de clubes de
            serviço do mundo, com mais de 1,4 milhão de membros em 200 países — o Distrito LC-11
            representa uma rede vibrante de voluntários comprometidos com o lema universal dos
            Leões: <strong className="text-foreground">"Nós Servimos"</strong>.
          </p>
          <p className="text-muted-foreground">
            Ao longo das décadas, nossos clubes conduziram milhares de ações: campanhas de saúde
            ocular, doações de cadeiras de rodas, distribuição de alimentos, mutirões ambientais,
            apoio a hospitais infantis e iniciativas educativas. Cada clube tem autonomia para
            identificar as prioridades locais — e o distrito articula esforços maiores em conjunto.
          </p>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nossos valores</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            O que nos guia
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <CheckCircle2 className="h-8 w-8 text-gold" />
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="font-display text-5xl font-bold text-primary">1917</div>
            <p className="mt-2 font-semibold">Fundação do Lions Clubs International</p>
            <p className="mt-2 text-sm text-muted-foreground">Em Chicago, EUA, por Melvin Jones.</p>
          </div>
          <div>
            <div className="font-display text-5xl font-bold text-primary">200+</div>
            <p className="mt-2 font-semibold">Países e regiões geográficas</p>
            <p className="mt-2 text-sm text-muted-foreground">Uma rede verdadeiramente global de servidores.</p>
          </div>
          <div>
            <div className="font-display text-5xl font-bold text-primary">1,4M</div>
            <p className="mt-2 font-semibold">Leões no mundo</p>
            <p className="mt-2 text-sm text-muted-foreground">Voluntários ativos em mais de 48 mil clubes.</p>
          </div>
        </div>
      </section>
    </>
  );
}
