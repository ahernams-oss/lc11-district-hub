import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Eye, Heart, Leaf, Activity, Baby } from "lucide-react";
import envImg from "@/assets/project-environment.jpg";
import visionImg from "@/assets/project-vision.jpg";
import hungerImg from "@/assets/project-hunger.jpg";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos e Causas — Distrito LC-11" },
      { name: "description", content: "Nossos projetos de serviço nas cinco causas globais do Lions: visão, fome, meio ambiente, diabetes e câncer infantil." },
      { property: "og:title", content: "Projetos e Causas — Distrito LC-11" },
      { property: "og:description", content: "Conheça os projetos de serviço do Distrito LC-11." },
      { property: "og:url", content: "/projetos" },
    ],
    links: [{ rel: "canonical", href: "/projetos" }],
  }),
  component: Projetos,
});

const causes = [
  { icon: Eye, title: "Visão", desc: "Triagens, doação de óculos, cirurgias de catarata e Banco de Olhos do Distrito." },
  { icon: Heart, title: "Combate à Fome", desc: "Campanhas de arrecadação, sopões e parcerias com bancos de alimentos locais." },
  { icon: Leaf, title: "Meio Ambiente", desc: "Plantio de árvores nativas, mutirões de limpeza e educação ambiental escolar." },
  { icon: Activity, title: "Diabetes", desc: "Testes de glicemia comunitários, palestras e apoio a portadores e familiares." },
  { icon: Baby, title: "Câncer Infantil", desc: "Apoio direto a hospitais, casas de apoio e famílias em tratamento." },
];

const featured = [
  { title: "Olhar para o Futuro", img: visionImg, tag: "Visão", desc: "Mutirão de triagem oftalmológica que atendeu mais de 1.200 crianças em escolas públicas em 2025." },
  { title: "Mesa Solidária", img: hungerImg, tag: "Fome", desc: "Distribuição mensal de cestas básicas e refeições quentes em parceria com 18 clubes do distrito." },
  { title: "Distrito Verde", img: envImg, tag: "Meio Ambiente", desc: "Plantio de 5.000 mudas nativas em áreas degradadas ao longo de 2025." },
];

function Projetos() {
  return (
    <>
      <PageHero
        eyebrow="O que fazemos"
        title="Projetos que transformam realidades."
        description="Atuamos nas cinco causas globais do Lions Clubs International — articulando clubes, parceiros e voluntários para gerar impacto real."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">As cinco causas globais</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Definidas pelo Lions Clubs International como prioridades de longo prazo para servir a
          humanidade.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {causes.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Projetos em destaque</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featured.map((p) => (
              <article key={p.title} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={p.img} alt={p.title} width={1024} height={640} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">{p.tag}</span>
                  <h3 className="mt-3 font-display text-xl font-bold text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
