import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/protocolo-leonistico")({
  head: () => ({
    meta: [
      { title: "Protocolo Leonístico — Distrito LC-11" },
      { name: "description", content: "Normas de protocolo, precedência e cerimonial nas reuniões e eventos do Lions Clubs International - Distrito LC-11." },
      { property: "og:title", content: "Protocolo Leonístico — Distrito LC-11" },
      { property: "og:description", content: "Diretrizes de protocolo e cerimonial leonístico." },
    ],
    links: [{ rel: "canonical", href: "/protocolo-leonistico" }],
  }),
  component: ProtocoloLeonistico,
});

const precedencia = [
  "Presidente Internacional",
  "Ex-Presidentes Internacionais",
  "Diretores Internacionais",
  "Ex-Diretores Internacionais",
  "Governador do Distrito",
  "Ex-Governadores",
  "1º Vice-Governador",
  "2º Vice-Governador",
  "Coordenador de Gabinete",
  "Secretário de Gabinete",
  "Tesoureiro de Gabinete",
  "Presidentes de Divisão",
  "Presidentes de Região",
  "Presidentes de Clube",
];

const cerimonial = [
  {
    titulo: "Abertura da Reunião",
    desc: "O presidente declara aberta a sessão, faz a saudação às bandeiras e convida para a execução do Hino Nacional.",
  },
  {
    titulo: "Composição da Mesa",
    desc: "A mesa diretora é composta seguindo a ordem de precedência, com o anfitrião à direita da autoridade máxima presente.",
  },
  {
    titulo: "Saudação às Bandeiras",
    desc: "Bandeira Nacional, Bandeira do Estado, Bandeira do Município e Bandeira do Lions Internacional, nesta ordem.",
  },
  {
    titulo: "Uso dos Distintivos",
    desc: "Todos os companheiros devem portar o distintivo leonístico durante reuniões oficiais e eventos institucionais.",
  },
  {
    titulo: "Encerramento",
    desc: "Após os pronunciamentos, o presidente agradece a presença de todos e declara encerrada a sessão.",
  },
];

function ProtocoloLeonistico() {
  return (
    <>
      <PageHero
        eyebrow="Cerimonial e protocolo"
        title="Protocolo Leonístico"
        description="Diretrizes de precedência, cerimonial e conduta nas reuniões e eventos oficiais do Distrito LC-11."
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Ordem de Precedência
        </h2>
        <p className="mt-3 text-muted-foreground">
          A ordem de precedência define como autoridades leonísticas são saudadas, compõem mesas e se manifestam em eventos oficiais.
        </p>
        <ol className="mt-6 space-y-2">
          {precedencia.map((p, i) => (
            <li
              key={p}
              className="flex items-start gap-4 rounded-md border border-border bg-card p-4 shadow-card"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="pt-1 font-medium text-foreground">{p}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Cerimonial das Reuniões
          </h2>
          <p className="mt-3 text-muted-foreground">
            Etapas e práticas recomendadas para a condução de reuniões e solenidades leonísticas.
          </p>
          <div className="mt-8 space-y-6">
            {cerimonial.map((c) => (
              <article
                key={c.titulo}
                className="rounded-xl border border-border bg-card p-6 shadow-card"
              >
                <h3 className="font-display text-lg font-bold text-primary">{c.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-xl font-bold text-foreground">Observações Gerais</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Todas as autoridades devem ser saudadas pelo título e nome completo.</li>
            <li>O uso do colar de governador é restrito ao Governador em exercício.</li>
            <li>Ex-Governadores utilizam o distintivo correspondente ao seu posto.</li>
            <li>Convidados externos são posicionados conforme orientação da autoridade leonística máxima presente.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
