import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { FileText } from "lucide-react";

const docs: Record<string, { title: string; description: string; eyebrow: string }> = {
  "atos-governador/al-2026-2027": {
    eyebrow: "Atos do(a) Governador(a)",
    title: "AL 2026-2027",
    description: "Atos oficiais do(a) Governador(a) referentes ao Ano Leonístico 2026-2027.",
  },
  "atos-governador/al-2027-2028": {
    eyebrow: "Atos do(a) Governador(a)",
    title: "AL 2027-2028",
    description: "Atos oficiais do(a) Governador(a) referentes ao Ano Leonístico 2027-2028.",
  },
  "estatuto-lions-internacional": {
    eyebrow: "Documento oficial",
    title: "Estatuto Lions Internacional",
    description: "Estatuto da Associação Internacional de Lions Clubes (Lions Clubs International).",
  },
  "estatuto-dmlc": {
    eyebrow: "Documento oficial",
    title: "Estatuto DMLC",
    description: "Estatuto do Distrito Múltiplo LC.",
  },
  "estatuto-distrito-lc-11": {
    eyebrow: "Documento oficial",
    title: "Estatuto Distrito LC-11",
    description: "Estatuto do Distrito LC-11.",
  },
  "estatuto-padrao-clubes": {
    eyebrow: "Documento oficial",
    title: "Estatuto Padrão dos Clubes",
    description: "Estatuto padrão aplicável aos Lions Clubes.",
  },
  "regulamento-sede": {
    eyebrow: "Documento oficial",
    title: "Regulamento da Sede",
    description: "Regulamento da Sede do Distrito LC-11.",
  },
};

export const Route = createFileRoute("/documentos/$")({
  loader: ({ params }) => {
    const slug = params._splat ?? "";
    const doc = docs[slug];
    if (!doc) throw notFound();
    return { slug, doc };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.doc.title ?? "Documento";
    return {
      meta: [
        { title: `${t} — Distrito LC-11` },
        { name: "description", content: loaderData?.doc.description ?? "" },
      ],
    };
  },
  component: DocumentoPage,
  notFoundComponent: () => (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Documento não encontrado</h1>
    </section>
  ),
});

function DocumentoPage() {
  const { doc } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow={doc.eyebrow} title={doc.title} description={doc.description} />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Em breve</h2>
            <p className="mt-2 text-muted-foreground">
              O conteúdo deste documento será disponibilizado em breve nesta página.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
