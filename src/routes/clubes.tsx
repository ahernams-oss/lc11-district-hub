import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/clubes")({
  head: () => ({
    meta: [
      { title: "Clubes — Distrito LC-11" },
      { name: "description", content: "Encontre os clubes Lions do Distrito LC-11 e seus contatos." },
      { property: "og:title", content: "Clubes do Distrito LC-11" },
      { property: "og:description", content: "Lista de clubes Lions ativos no Distrito LC-11." },
      { property: "og:url", content: "/clubes" },
    ],
    links: [{ rel: "canonical", href: "/clubes" }],
  }),
  component: Clubes,
});

type Clube = { nome: string; cidade: string; divisao: string; reunioes: string; email: string };

const CLUBES: Clube[] = [
  { nome: "Lions Clube Centro", cidade: "São Paulo", divisao: "A", reunioes: "2ª e 4ª terça, 20h", email: "centro@distritolc11.org" },
  { nome: "Lions Clube Norte", cidade: "São Paulo", divisao: "A", reunioes: "1ª e 3ª quinta, 20h", email: "norte@distritolc11.org" },
  { nome: "Lions Clube Sul", cidade: "São Paulo", divisao: "B", reunioes: "Quartas-feiras, 19h30", email: "sul@distritolc11.org" },
  { nome: "Lions Clube Leste", cidade: "Guarulhos", divisao: "B", reunioes: "1ª terça, 20h", email: "leste@distritolc11.org" },
  { nome: "Lions Clube Oeste", cidade: "Osasco", divisao: "C", reunioes: "2ª e 4ª quarta, 20h", email: "oeste@distritolc11.org" },
  { nome: "Lions Clube Vila Mariana", cidade: "São Paulo", divisao: "A", reunioes: "Quintas-feiras, 19h", email: "vilamariana@distritolc11.org" },
  { nome: "Lions Clube Santo André", cidade: "Santo André", divisao: "D", reunioes: "1ª e 3ª quarta, 20h", email: "santoandre@distritolc11.org" },
  { nome: "Lions Clube Campinas", cidade: "Campinas", divisao: "E", reunioes: "2ª terça, 20h", email: "campinas@distritolc11.org" },
  { nome: "Lions Clube Sorocaba", cidade: "Sorocaba", divisao: "E", reunioes: "Quartas-feiras, 20h", email: "sorocaba@distritolc11.org" },
  { nome: "Lions Clube Ribeirão Preto", cidade: "Ribeirão Preto", divisao: "F", reunioes: "1ª e 3ª segunda, 20h", email: "ribeirao@distritolc11.org" },
  { nome: "Lions Clube São José", cidade: "São José dos Campos", divisao: "G", reunioes: "Terças-feiras, 19h30", email: "saojose@distritolc11.org" },
  { nome: "Lions Clube Santos", cidade: "Santos", divisao: "H", reunioes: "2ª quinta, 20h", email: "santos@distritolc11.org" },
];

function Clubes() {
  const [q, setQ] = useState("");
  const [divisao, setDivisao] = useState<string>("Todas");

  const divisoes = useMemo(() => ["Todas", ...Array.from(new Set(CLUBES.map((c) => c.divisao))).sort()], []);

  const filtered = CLUBES.filter((c) => {
    const matchQ = q.trim() === "" || c.nome.toLowerCase().includes(q.toLowerCase()) || c.cidade.toLowerCase().includes(q.toLowerCase());
    const matchD = divisao === "Todas" || c.divisao === divisao;
    return matchQ && matchD;
  });

  return (
    <>
      <PageHero
        eyebrow="Nossa rede"
        title="Encontre um clube perto de você."
        description="Mais de 65 clubes ativos no Distrito LC-11, cada um com sua identidade e área de atuação."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou cidade..."
              className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap">
            {divisoes.map((d) => (
              <button
                key={d}
                onClick={() => setDivisao(d)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  divisao === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {d === "Todas" ? d : `Divisão ${d}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <article key={c.nome} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-foreground">{c.nome}</h3>
                <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">Div. {c.divisao}</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {c.cidade}</p>
                <p>📅 {c.reunioes}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {c.email}</p>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Nenhum clube encontrado para a busca.</p>
        )}
      </section>
    </>
  );
}
