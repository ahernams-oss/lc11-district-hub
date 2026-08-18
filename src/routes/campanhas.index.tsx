import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { listCampanhas } from "@/lib/campanhas";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/campanhas/")({
  head: () => ({
    meta: [
      { title: "Campanhas — Distrito LC-11" },
      { name: "description", content: "Conheça as campanhas de arrecadação do Distrito LC-11 e contribua diretamente com a causa que mais toca você." },
      { property: "og:title", content: "Campanhas — Distrito LC-11" },
      { property: "og:description", content: "Contribua com as campanhas ativas do Distrito LC-11." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/campanhas" }],
  }),
  component: Campanhas,
});

function Campanhas() {
  const { data: campanhas = [], isLoading } = useQuery({
    queryKey: ["campanhas-ativas"],
    queryFn: listCampanhas,
  });

  return (
    <>
      <PageHero
        eyebrow="Arrecadação"
        title="Campanhas ativas"
        description="Escolha uma causa específica e acompanhe o impacto da sua contribuição."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando campanhas…</p>
        ) : campanhas.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <HeartHandshake className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-4 text-muted-foreground">Nenhuma campanha ativa no momento.</p>
            <Link to="/doar" className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Fazer uma doação
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campanhas.map((c) => (
              <Link
                key={c.id}
                to="/campanhas/$slug"
                params={{ slug: c.slug }}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1"
              >
                {c.imagem_url && (
                  <img src={c.imagem_url} alt={c.titulo} loading="lazy" className="h-44 w-full object-cover" />
                )}
                <div className="p-6">
                  <h2 className="font-display text-lg font-bold group-hover:text-gold">{c.titulo}</h2>
                  {c.descricao && <p className="mt-2 text-sm text-muted-foreground">{c.descricao}</p>}
                  <span className="mt-4 inline-block text-sm font-semibold text-gold">Contribuir →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
