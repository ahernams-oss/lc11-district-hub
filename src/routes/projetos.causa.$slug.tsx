import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Eye, Heart, Leaf, Activity, Baby, Plus, ArrowLeft } from "lucide-react";
import { useProjects } from "@/lib/projects";
import { useAuth } from "@/hooks/use-auth";

export const causes = [
  { slug: "visao", tag: "Visão", icon: Eye, desc: "Triagens, doação de óculos, cirurgias de catarata e Banco de Olhos do Distrito." },
  { slug: "combate-fome", tag: "Combate à Fome", icon: Heart, desc: "Campanhas de arrecadação, sopões e parcerias com bancos de alimentos locais." },
  { slug: "meio-ambiente", tag: "Meio Ambiente", icon: Leaf, desc: "Plantio de árvores nativas, mutirões de limpeza e educação ambiental escolar." },
  { slug: "diabetes", tag: "Diabetes", icon: Activity, desc: "Testes de glicemia comunitários, palestras e apoio a portadores e familiares." },
  { slug: "cancer-infantil", tag: "Câncer Infantil", icon: Baby, desc: "Apoio direto a hospitais, casas de apoio e famílias em tratamento." },
];

export const Route = createFileRoute("/projetos/causa/$slug")({
  beforeLoad: ({ params }) => {
    if (!causes.find((c) => c.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const c = causes.find((x) => x.slug === params.slug);
    const title = c ? `${c.tag} — Projetos` : "Projetos";
    return {
      meta: [
        { title: `${title} — Distrito LC-11` },
        { name: "description", content: c?.desc ?? "" },
      ],
    };
  },
  component: CausaPage,
});

function CausaPage() {
  const { slug } = Route.useParams();
  const cause = causes.find((c) => c.slug === slug)!;
  const { data = [], isLoading } = useProjects();
  const { canEditContent } = useAuth();
  const Icon = cause.icon;

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const target = normalize(cause.tag);
  const items = data.filter((p) => p.tag && normalize(p.tag) === target);

  return (
    <>
      <PageHero eyebrow="Causa global" title={cause.tag} description={cause.desc} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/projetos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Todas as causas
          </Link>
          {canEditContent && (
            <Link
              to="/admin/projetos/$id"
              params={{ id: "novo" }}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Cadastrar projeto
            </Link>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Projetos em {cause.tag}
          </h2>
        </div>

        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              Nenhum projeto cadastrado nesta causa ainda.
            </p>
            {canEditContent && (
              <Link
                to="/admin/projetos/$id"
                params={{ id: "novo" }}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Cadastrar primeiro projeto
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {items.map((p) => (
              <Link
                key={p.id}
                to="/projetos/$id"
                params={{ id: p.id }}
                className="block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1 hover:border-primary"
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
                  <span className="mt-4 inline-block text-sm font-semibold text-primary">
                    Ver projeto →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
