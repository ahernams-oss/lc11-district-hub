import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { FileText, ExternalLink, Download } from "lucide-react";
import { useDocuments, RGD_YEARS, RGD_ITEMS } from "@/lib/documents";

type DocPageMeta = {
  eyebrow: string;
  title: string;
  description: string;
  category: string;
};

const rgdPages: Record<string, DocPageMeta> = Object.fromEntries(
  RGD_YEARS.flatMap((y) =>
    RGD_ITEMS.map((it) => [
      `rgds-convencao/al-${y}/${it.suffix}`,
      {
        eyebrow: `RGDs e Convenção — AL ${y}`,
        title: it.label,
        description: `${it.label} do Ano Leonístico ${y}.`,
        category: `rgds-convencao-al-${y}-${it.suffix}`,
      } satisfies DocPageMeta,
    ]),
  ),
);

const pages: Record<string, DocPageMeta> = {
  "atos-governador/al-2026-2027": {
    eyebrow: "Atos do(a) Governador(a)",
    title: "AL 2026-2027",
    description:
      "Atos oficiais do(a) Governador(a) referentes ao Ano Leonístico 2026-2027.",
    category: "atos-governador-al-2026-2027",
  },
  "atos-governador/al-2027-2028": {
    eyebrow: "Atos do(a) Governador(a)",
    title: "AL 2027-2028",
    description:
      "Atos oficiais do(a) Governador(a) referentes ao Ano Leonístico 2027-2028.",
    category: "atos-governador-al-2027-2028",
  },
  ...rgdPages,
  "estatuto-lions-internacional": {
    eyebrow: "Documento oficial",
    title: "Estatuto Lions Internacional",
    description:
      "Estatuto da Associação Internacional de Lions Clubes (Lions Clubs International).",
    category: "estatuto-lions-internacional",
  },
  "estatuto-dmlc": {
    eyebrow: "Documento oficial",
    title: "Estatuto DMLC",
    description: "Estatuto do Distrito Múltiplo LC.",
    category: "estatuto-dmlc",
  },
  "estatuto-distrito-lc-11": {
    eyebrow: "Documento oficial",
    title: "Estatuto Distrito LC-11",
    description: "Estatuto do Distrito LC-11.",
    category: "estatuto-distrito-lc-11",
  },
  "estatuto-padrao-clubes": {
    eyebrow: "Documento oficial",
    title: "Estatuto Padrão dos Clubes",
    description: "Estatuto padrão aplicável aos Lions Clubes.",
    category: "estatuto-padrao-clubes",
  },
  "regulamento-sede": {
    eyebrow: "Documento oficial",
    title: "Regulamento da Sede",
    description: "Regulamento da Sede do Distrito LC-11.",
    category: "regulamento-sede",
  },
};


export const Route = createFileRoute("/documentos/$")({
  loader: ({ params }) => {
    const slug = (params._splat ?? "").toLowerCase();
    const page = pages[slug];
    if (!page) throw notFound();
    return { slug, page };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.page.title ?? "Documento";
    return {
      meta: [
        { title: `${t} — Distrito LC-11` },
        { name: "description", content: loaderData?.page.description ?? "" },
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
  const { page } = Route.useLoaderData();
  const { data: docs = [], isLoading } = useDocuments(page.category);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando documentos...</p>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-card/50 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <h2 className="font-display text-xl font-bold">Nenhum documento publicado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Os documentos desta seção serão disponibilizados em breve.
              </p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4">
            {docs.map((d) => {
              const href = d.file_url || d.external_url || "#";
              const isExternal = !!d.external_url && !d.file_url;
              return (
                <li
                  key={d.id}
                  className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-start"
                >
                  <FileText className="h-6 w-6 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold">{d.title}</h3>
                    {d.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    {isExternal ? (
                      <>
                        Abrir <ExternalLink className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Baixar <Download className="h-4 w-4" />
                      </>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
