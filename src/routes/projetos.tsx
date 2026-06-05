import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Eye, Heart, Leaf, Activity, Baby } from "lucide-react";
import { useProjects } from "@/lib/projects";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos e Causas — Distrito LC-11" },
      { name: "description", content: "Nossos projetos de serviço nas cinco causas globais do Lions." },
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

function Projetos() {
  const { data = [], isLoading } = useProjects();
  return (
    <>
      <PageHero
        eyebrow="O que fazemos"
        title="Projetos que transformam realidades."
        description="Atuamos nas cinco causas globais do Lions Clubs International — articulando clubes, parceiros e voluntários para gerar impacto real."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          As cinco causas globais
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Definidas pelo Lions Clubs International como prioridades de longo prazo para servir a
          humanidade.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {causes.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
            >
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
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Projetos em destaque
          </h2>
          {isLoading ? (
            <p className="mt-6 text-muted-foreground">Carregando...</p>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {data.map((p) => (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
                >
                  {p.cover_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {p.tag && (
                      <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                        {p.tag}
                      </span>
                    )}
                    <h3 className="mt-3 font-display text-xl font-bold text-foreground">{p.title}</h3>
                    {p.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
              {data.length === 0 && (
                <p className="text-muted-foreground">Nenhum projeto cadastrado ainda.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
