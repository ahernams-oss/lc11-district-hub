import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/assessoria")({
  head: () => ({
    meta: [
      { title: "Assessoria — Distrito LC-11" },
      { name: "description", content: "Assessoria do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/assessoria" }],
  }),
  component: Assessoria,
});

function Assessoria() {
  return (
    <>
      <PageHero
        eyebrow="Liderança 2025–2026"
        title="Assessoria Distrital"
        description="Suporte estratégico e administrativo à governadoria do Distrito LC-11."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="font-display text-2xl font-bold">Assessoria</h2>
          <p className="text-muted-foreground">
            A Assessoria Distrital presta suporte direto à Governadoria e aos Vice-Governadores nas decisões estratégicas, comunicação institucional e articulação com os clubes e o Lions Clubs International.
          </p>
          <p className="text-muted-foreground">
            Também acompanha a execução das metas distritais, organiza relatórios e auxilia na gestão de crises e oportunidades ao longo do ano leonístico.
          </p>
        </div>
      </section>
    </>
  );
}
