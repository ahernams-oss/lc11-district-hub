import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Calendar } from "lucide-react";
import { useNews } from "@/lib/news";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Notícias — Distrito LC-11" },
      { name: "description", content: "Últimas notícias e comunicados do Distrito LC-11." },
      { property: "og:title", content: "Notícias — Distrito LC-11" },
      { property: "og:description", content: "Acompanhe as últimas notícias do distrito." },
      { property: "og:url", content: "/noticias" },
    ],
    links: [{ rel: "canonical", href: "/noticias" }],
  }),
  component: Noticias,
});

function Noticias() {
  const { data = [], isLoading } = useNews(true);
  return (
    <>
      <PageHero
        eyebrow="Notícias"
        title="Acompanhe o que acontece no Distrito."
        description="Histórias, conquistas e comunicados oficiais do Distrito LC-11."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <article
                key={p.id}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                {p.cover_url && (
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    className="mb-4 aspect-video w-full rounded-md object-cover"
                  />
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {p.tag && (
                    <span className="rounded-full bg-accent px-3 py-1 font-semibold uppercase tracking-wider text-primary">
                      {p.tag}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{" "}
                    {new Date(p.published_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {p.excerpt}
                  </p>
                )}
              </article>
            ))}
            {data.length === 0 && (
              <p className="text-muted-foreground">Nenhuma notícia publicada ainda.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
