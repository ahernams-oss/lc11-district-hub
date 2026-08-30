import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Pencil } from "lucide-react";
import { useNewsItem } from "@/lib/news";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/noticias/$id")({
  head: () => ({
    meta: [
      { title: "Notícia — Distrito LC-11" },
      { name: "description", content: "Leia a notícia completa publicada pelo Distrito LC-11." },
      { property: "og:title", content: "Notícia — Distrito LC-11" },
      { property: "og:description", content: "Leia a notícia completa do Distrito LC-11." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsDetail,
});

function NewsDetail() {
  const { id } = Route.useParams();
  const { data: item, isLoading } = useNewsItem(id);
  const { canEditContent } = useAuth();

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">Carregando...</p>;
  }
  if (!item) throw notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/noticias"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para notícias
        </Link>
        {canEditContent && (
          <Link
            to="/admin/noticias/$id"
            params={{ id: item.id }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {item.tag && (
          <span className="rounded-full bg-accent px-3 py-1 font-semibold uppercase tracking-wider text-primary">
            {item.tag}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(item.published_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
        {!item.published && (
          <span className="rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
            Rascunho
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {item.title}
      </h1>

      {item.excerpt && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{item.excerpt}</p>
      )}

      {item.cover_url && (
        <img
          src={item.cover_url}
          alt={item.title}
          className="mt-8 w-full rounded-xl border border-border object-cover shadow-card"
          loading="lazy"
        />
      )}

      {item.content && (
        <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
          {item.content
            .split(/\n{2,}/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
        </div>
      )}
    </article>
  );
}
