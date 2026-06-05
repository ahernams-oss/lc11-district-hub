import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/clubes/regiao/$letra")({
  head: ({ params }) => {
    const letra = (params.letra || "").toUpperCase();
    return {
      meta: [
        { title: `Região ${letra} — Distrito LC-11` },
        { name: "description", content: `Clubes Lions da Região ${letra} do Distrito LC-11.` },
        { property: "og:title", content: `Região ${letra} — Distrito LC-11` },
        { property: "og:description", content: `Clubes Lions da Região ${letra} do Distrito LC-11.` },
      ],
    };
  },
  component: RegiaoDetalhe,
});

type RegiaoInfo = {
  letra: string;
  nome: string;
  descricao: string;
  cidades: string[];
  clubes: { nome: string; cidade: string }[];
};

const REGIOES: Record<string, RegiaoInfo> = {
  A: {
    letra: "A",
    nome: "Região A — Metropolitana Central",
    descricao: "Clubes da região central da capital paulista.",
    cidades: ["São Paulo (Centro)", "São Paulo (Norte)", "São Paulo (Vila Mariana)"],
    clubes: [
      { nome: "Lions Clube Centro", cidade: "São Paulo" },
      { nome: "Lions Clube Norte", cidade: "São Paulo" },
      { nome: "Lions Clube Vila Mariana", cidade: "São Paulo" },
    ],
  },
  B: {
    letra: "B",
    nome: "Região B — Metropolitana Sul/Leste",
    descricao: "Clubes da zona sul da capital e municípios da Grande São Paulo a leste.",
    cidades: ["São Paulo (Sul)", "Guarulhos"],
    clubes: [
      { nome: "Lions Clube Sul", cidade: "São Paulo" },
      { nome: "Lions Clube Leste", cidade: "Guarulhos" },
    ],
  },
  C: {
    letra: "C",
    nome: "Região C — Oeste",
    descricao: "Clubes da região oeste da Grande São Paulo.",
    cidades: ["Osasco", "Cotia", "Itapevi"],
    clubes: [{ nome: "Lions Clube Oeste", cidade: "Osasco" }],
  },
  D: {
    letra: "D",
    nome: "Região D — ABC Paulista",
    descricao: "Clubes da região do ABC.",
    cidades: ["Santo André", "São Bernardo", "São Caetano"],
    clubes: [{ nome: "Lions Clube Santo André", cidade: "Santo André" }],
  },
  E: {
    letra: "E",
    nome: "Região E — Campinas e Sorocaba",
    descricao: "Clubes do interior paulista nas regiões de Campinas e Sorocaba.",
    cidades: ["Campinas", "Sorocaba", "Jundiaí"],
    clubes: [
      { nome: "Lions Clube Campinas", cidade: "Campinas" },
      { nome: "Lions Clube Sorocaba", cidade: "Sorocaba" },
    ],
  },
  F: {
    letra: "F",
    nome: "Região F — Ribeirão Preto",
    descricao: "Clubes da região de Ribeirão Preto.",
    cidades: ["Ribeirão Preto", "Sertãozinho", "Jaboticabal"],
    clubes: [{ nome: "Lions Clube Ribeirão Preto", cidade: "Ribeirão Preto" }],
  },
};

function RegiaoDetalhe() {
  const { letra } = Route.useParams();
  const key = letra.toUpperCase();
  const regiao = REGIOES[key];

  if (!regiao) throw notFound();

  return (
    <>
      <PageHero
        eyebrow={`Divisão ${regiao.letra}`}
        title={regiao.nome}
        description={regiao.descricao}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-foreground">Cidades atendidas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {regiao.cidades.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground/80">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {c}
            </span>
          ))}
        </div>

        <h2 className="mt-10 font-display text-2xl font-bold text-foreground">Clubes da região</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regiao.clubes.map((c) => (
            <article key={c.nome} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display text-lg font-bold text-foreground">{c.nome}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" /> {c.cidade}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
