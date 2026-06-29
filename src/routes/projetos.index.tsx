import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/PageHero";
import { Eye, Heart, Leaf, Activity, Baby } from "lucide-react";
import { useProjects } from "@/lib/projects";

function ProjectImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(id);
  }, [images.length]);
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-white">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setIdx(i); }}
              aria-label={`Foto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/projetos/")({
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
  { slug: "visao", icon: Eye, title: "Visão", desc: "Triagens, doação de óculos, cirurgias de catarata e Banco de Olhos do Distrito." },
  { slug: "combate-fome", icon: Heart, title: "Combate à Fome", desc: "Campanhas de arrecadação, sopões e parcerias com bancos de alimentos locais." },
  { slug: "meio-ambiente", icon: Leaf, title: "Meio Ambiente", desc: "Plantio de árvores nativas, mutirões de limpeza e educação ambiental escolar." },
  { slug: "diabetes", icon: Activity, title: "Diabetes", desc: "Testes de glicemia comunitários, palestras e apoio a portadores e familiares." },
  { slug: "cancer-infantil", icon: Baby, title: "Câncer Infantil", desc: "Apoio direto a hospitais, casas de apoio e famílias em tratamento." },
];

function Projetos() {
  const { data = [], isLoading } = useProjects();
  const [filter, setFilter] = useState<string>("todas");
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const filtered = filter === "todas"
    ? data
    : data.filter((p) => p.tag && normalize(p.tag) === normalize(causes.find((c) => c.slug === filter)?.title ?? ""));
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
            <Link
              key={c.title}
              to="/projetos/causa/$slug"
              params={{ slug: c.slug }}
              className="block rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1 hover:border-primary"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Ver projetos →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Projetos em destaque
          </h2>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("todas")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filter === "todas"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              Todas
            </button>
            {causes.map((c) => (
              <button
                key={c.slug}
                onClick={() => setFilter(c.slug)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  filter === c.slug
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:border-primary"
                }`}
              >
                <c.icon className="h-3.5 w-3.5" />
                {c.title}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="mt-6 text-muted-foreground">Carregando...</p>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {filtered.map((p) => {
                const imgs = [p.cover_url, ...(p.gallery_urls ?? [])].filter(Boolean) as string[];
                return (
                <Link
                  key={p.id}
                  to="/projetos/$id"
                  params={{ id: p.id }}
                  className="block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1 hover:border-primary"
                >
                  {imgs.length > 0 && <ProjectImageCarousel images={imgs} alt={p.title} />}
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
                </Link>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-muted-foreground">
                  {data.length === 0
                    ? "Nenhum projeto cadastrado ainda."
                    : "Nenhum projeto nesta causa ainda."}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
