import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { User } from "lucide-react";

export const Route = createFileRoute("/ex-governadores")({
  head: () => ({
    meta: [
      { title: "Galeria de Ex-Governadores — Distrito LC-11" },
      { name: "description", content: "Conheça os ex-governadores que lideraram o Distrito LC-11 ao longo dos anos." },
      { property: "og:title", content: "Galeria de Ex-Governadores — Distrito LC-11" },
      { property: "og:description", content: "A trajetória de liderança do Distrito LC-11 através das gestões passadas." },
    ],
    links: [{ rel: "canonical", href: "/ex-governadores" }],
  }),
  component: ExGovernadores,
});

const exGovernadores = [
  { ano: "2024–2025", nome: "CL Carlos Alberto Silva", lema: "Servir com visão" },
  { ano: "2023–2024", nome: "CL Maria Fernanda Costa", lema: "Unidos pelo bem" },
  { ano: "2022–2023", nome: "CL João Pedro Oliveira", lema: "Liderança que transforma" },
  { ano: "2021–2022", nome: "CL Ana Beatriz Souza", lema: "Servir é nossa missão" },
  { ano: "2020–2021", nome: "CL Roberto Dias Lima", lema: "Juntos fazemos a diferença" },
  { ano: "2019–2020", nome: "CL Patricia Mendes Rocha", lema: "Compromisso e ação" },
  { ano: "2018–2019", nome: "CL Fernando Henrique Alves", lema: "Olhar para o futuro" },
  { ano: "2017–2018", nome: "CL Lucia Helena Braga", lema: "Servir sem limites" },
];

function ExGovernadores() {
  return (
    <>
      <PageHero
        eyebrow="História do distrito"
        title="Galeria de Ex-Governadores"
        description="Líderes que dedicaram seu tempo e talento para fortalecer o Distrito LC-11 ao longo dos anos."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exGovernadores.map((g) => (
            <div
              key={g.ano}
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-card transition-transform hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface">
                <User className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <div className="mt-4 font-display text-lg font-bold text-foreground">{g.nome}</div>
              <div className="mt-1 text-sm font-semibold text-primary">{g.ano}</div>
              <div className="mt-2 text-sm italic text-muted-foreground">"{g.lema}"</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
