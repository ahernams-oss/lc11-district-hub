import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { getProtocolTopic } from "@/lib/protocol-menu";

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
  return <>
    <PageHero eyebrow="Protocolo Leonístico" title={topic.label} />
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Button asChild variant="ghost"><Link to="/protocolo-leonistico"><ArrowLeft /> Protocolo Leonístico</Link></Button>
      <p className="mt-8 text-muted-foreground">Nenhum conteúdo publicado nesta seção.</p>
    </section>
  </>;
}