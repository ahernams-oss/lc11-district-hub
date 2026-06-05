import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/gat")({
  head: () => ({
    meta: [
      { title: "GAT — Distrito LC-11" },
      { name: "description", content: "Grupo de Ação e Trabalho (GAT) do Distrito LC-11." },
    ],
    links: [{ rel: "canonical", href: "/gat" }],
  }),
  component: Gat,
});

function Gat() {
  return (
    <>
      <PageHero
        eyebrow="Liderança 2025–2026"
        title="GAT — Grupo de Ação e Trabalho"
        description="Coordenação estratégica das ações de serviço do Distrito LC-11."
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="font-display text-2xl font-bold">Sobre o GAT</h2>
          <p className="text-muted-foreground">
            O Grupo de Ação e Trabalho (GAT) é responsável pelo planejamento e execução das atividades de serviço do Distrito LC-11. Coordena projetos, parcerias e mobiliza recursos para maximizar o impacto nas comunidades atendidas.
          </p>
          <p className="text-muted-foreground">
            Composto por companheiros Leões experientes, o GAT atua em estreita colaboração com os clubes para garantir que as cinco causas globais do Lions sejam atendidas com excelência e transparência.
          </p>
        </div>
      </section>
    </>
  );
}
