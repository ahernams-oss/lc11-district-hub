import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { BreakableText } from "@/components/BreakableText";
import { getProtocolTopic } from "@/lib/protocol-menu";
import { useProtocolTopic } from "@/lib/protocol-content";

export const Route = createFileRoute("/protocolo-leonistico_/$slug")({
  loader: ({ params }) => {
    const topic = getProtocolTopic(params.slug);
    if (!topic) throw notFound();
    return topic;
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.label ?? "Tema indisponível"} — Distrito LC-11`;
    const description = loaderData ? `${loaderData.label}: Protocolo Leonístico do Distrito LC-11.` : "Tema de Protocolo Leonístico indisponível.";
    return { meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ProtocolTopic,
});

function ProtocolTopic() {
  const topic = Route.useLoaderData();
  const { data: content, isPending } = useProtocolTopic(topic.slug);

  const published = !!content?.published;
  const hasContent = published && (
    (content?.title ?? "").trim() !== "" ||
    (content?.description ?? "").trim() !== "" ||
    (content?.body ?? "").trim() !== "" ||
    (content?.images.length ?? 0) > 0
  );

  return <>
    <PageHero
      eyebrow={content?.eyebrow?.trim() || "Protocolo Leonístico"}
      title={hasContent ? (content?.title?.trim() || topic.label) : topic.label}
      description={hasContent ? (content?.description?.trim() || undefined) : undefined}
    />
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button asChild variant="ghost"><Link to="/protocolo-leonistico"><ArrowLeft /> Protocolo Leonístico</Link></Button>

      {isPending ? (
        <p className="mt-8 text-muted-foreground">Carregando...</p>
      ) : !hasContent ? (
        <p className="mt-8 text-muted-foreground">Nenhum conteúdo publicado nesta seção.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {content?.body?.trim() && (
            <div className="space-y-4 text-base leading-relaxed text-foreground">
              {content.body.split(/\n{2,}/).map((block, index) => (
                <p key={index}><BreakableText text={block} /></p>
              ))}
            </div>
          )}

          {content && content.images.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {content.images.map((url, index) => (
                <img
                  key={url + index}
                  src={url}
                  alt=""
                  className="w-full rounded-xl border border-border object-cover shadow-card"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  </>;
}
