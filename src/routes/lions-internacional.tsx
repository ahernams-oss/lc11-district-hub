import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/lions-internacional")({
  head: () => ({
    meta: [
      { title: "Sobre o Lions Internacional — Distrito LC-11" },
      { name: "description", content: "Conheça o Lions Clubs International, a maior organização de clubes de serviço do mundo." },
      { property: "og:title", content: "Sobre o Lions Internacional" },
      { property: "og:description", content: "Mais de 1,4 milhão de membros em 200 países servindo comunidades pelo lema 'Nós Servimos'." },
    ],
    links: [{ rel: "canonical", href: "/lions-internacional" }],
  }),
  component: LionsInternacional,
});

function LionsInternacional() {
  return (
    <>
      <PageHero
        eyebrow="Lions Clubs International"
        title="A maior organização de clubes de serviço do mundo."
        description="Mais de 1,4 milhão de homens e mulheres em 200 países e regiões geográficas unidos pelo lema 'Nós Servimos'."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="font-display text-3xl font-bold">Quem somos</h2>
          <p className="text-muted-foreground">
            Fundado em 1917 em Chicago, EUA, por Melvin Jones, o Lions Clubs International nasceu
            com o propósito de unir pessoas de negócios em torno de uma causa maior: servir suas
            comunidades sem buscar recompensa pessoal. Mais de um século depois, essa visão se
            tornou um movimento global presente em mais de 48 mil clubes.
          </p>
          <h2 className="mt-10 font-display text-3xl font-bold">Causas globais</h2>
          <p className="text-muted-foreground">
            A organização concentra esforços em cinco causas globais: <strong>diabetes</strong>,
            <strong> visão</strong>, <strong>fome</strong>, <strong>meio ambiente</strong> e
            <strong> câncer infantil</strong>. Por meio da Fundação Lions Clubs International
            (LCIF), bilhões de dólares já foram destinados a projetos humanitários ao redor do
            mundo.
          </p>
          <h2 className="mt-10 font-display text-3xl font-bold">Estrutura</h2>
          <p className="text-muted-foreground">
            O Lions Internacional é organizado em Múltiplos Distritos, Distritos e Clubes. Cada
            nível tem autonomia para atender as necessidades locais, mantendo alinhamento com a
            missão global da associação.
          </p>
        </div>
      </section>
    </>
  );
}
