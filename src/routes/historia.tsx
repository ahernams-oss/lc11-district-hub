import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/historia")({
  head: () => ({
    meta: [
      { title: "Nossa História — Distrito LC-11" },
      { name: "description", content: "A trajetória do Distrito LC-11 do Lions Clubs International ao longo das décadas." },
      { property: "og:title", content: "Nossa História — Distrito LC-11" },
      { property: "og:description", content: "Décadas de serviço voluntário organizado em nossas comunidades." },
    ],
    links: [{ rel: "canonical", href: "/historia" }],
  }),
  component: Historia,
});

const marcos = [
  { ano: "1917", titulo: "Fundação do Lions Internacional", desc: "Melvin Jones funda em Chicago a maior organização de clubes de serviço do mundo." },
  { ano: "1920", titulo: "Internacionalização", desc: "O Lions deixa de ser apenas norte-americano e se expande para outros países." },
  { ano: "1957", titulo: "Chegada ao Brasil", desc: "O movimento Lions ganha força no país, com a fundação dos primeiros clubes." },
  { ano: "1970", titulo: "Formação do Distrito LC-11", desc: "Nasce o Distrito LC-11, reunindo clubes de toda a região com foco em serviço comunitário." },
  { ano: "2000", titulo: "Expansão dos projetos", desc: "Campanhas de saúde ocular, doações e mutirões ambientais ganham escala distrital." },
  { ano: "Hoje", titulo: "Um distrito vibrante", desc: "Dezenas de clubes ativos transformando vidas a cada ano com o lema 'Nós Servimos'." },
];

function Historia() {
  return (
    <>
      <PageHero
        eyebrow="Nossa história"
        title="Décadas servindo nossa comunidade."
        description="Conheça os marcos que construíram o Distrito LC-11 e a trajetória do movimento Lions na nossa região."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {marcos.map((m) => (
            <div key={m.ano} className="grid gap-4 border-l-4 border-primary pl-6 sm:grid-cols-[120px_1fr]">
              <div className="font-display text-3xl font-bold text-primary">{m.ano}</div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{m.titulo}</h3>
                <p className="mt-2 text-muted-foreground">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
