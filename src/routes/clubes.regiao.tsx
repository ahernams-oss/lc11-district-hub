import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/clubes/regiao")({
  head: () => ({
    meta: [
      { title: "Clubes por Região — Distrito LC-11" },
      { name: "description", content: "Explore os clubes Lions do Distrito LC-11 organizados por região e divisão." },
      { property: "og:title", content: "Clubes por Região — Distrito LC-11" },
      { property: "og:description", content: "Explore os clubes Lions do Distrito LC-11 organizados por região e divisão." },
      { property: "og:url", content: "/clubes/regiao" },
    ],
    links: [{ rel: "canonical", href: "/clubes/regiao" }],
  }),
  component: ClubesRegiao,
});

const REGIOES = [
  {
    nome: "Região Metropolitana — Divisão A",
    cidades: ["São Paulo (Centro)", "São Paulo (Norte)", "São Paulo (Vila Mariana)"],
    clubes: 3,
  },
  {
    nome: "Região Metropolitana — Divisão B",
    cidades: ["São Paulo (Sul)", "Guarulhos (Leste)"],
    clubes: 2,
  },
  {
    nome: "Região Oeste — Divisão C",
    cidades: ["Osasco", "Cotia", "Itapevi"],
    clubes: 1,
  },
  {
    nome: "Região do ABC — Divisão D",
    cidades: ["Santo André", "São Bernardo", "São Caetano"],
    clubes: 1,
  },
  {
    nome: "Região de Campinas — Divisão E",
    cidades: ["Campinas", "Sorocaba", "Jundiaí"],
    clubes: 2,
  },
  {
    nome: "Região de Ribeirão Preto — Divisão F",
    cidades: ["Ribeirão Preto", "Sertãozinho", "Jaboticabal"],
    clubes: 1,
  },
  {
    nome: "Região do Vale do Paraíba — Divisão G",
    cidades: ["São José dos Campos", "Taubaté", "Jacareí"],
    clubes: 1,
  },
  {
    nome: "Região Litoral — Divisão H",
    cidades: ["Santos", "São Vicente", "Praia Grande"],
    clubes: 1,
  },
];

function ClubesRegiao() {
  return (
    <>
      <PageHero
        eyebrow="Nossa rede"
        title="Clubes por Região."
        description="O Distrito LC-11 abrange diversas regiões do estado de São Paulo, organizadas em divisões para melhor gestão e apoio aos clubes."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REGIOES.map((r) => (
            <article key={r.nome} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-foreground">{r.nome}</h3>
                <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                  <Users className="h-3 w-3" /> {r.clubes} clube{r.clubes > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {r.cidades.map((cidade) => (
                  <p key={cidade} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> {cidade}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
