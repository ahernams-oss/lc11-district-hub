import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { MapPin, Mail, Search, User, Home } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllClubs } from "@/lib/regions";

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

function Clubes() {
  const { data: clubs = [], isLoading } = useAllClubs();
  const [q, setQ] = useState("");
  const [divisao, setDivisao] = useState<string>("Todas");

  const enriched = useMemo(
    () =>
      (clubs as any[]).map((c) => ({
        ...c,
        divisao: c.divisions?.code ?? "",
        regiao: c.divisions?.regions?.letter ?? "",
      })),
    [clubs],
  );

  const divisoes = useMemo(
    () => ["Todas", ...Array.from(new Set(enriched.map((c) => c.divisao).filter(Boolean))).sort()],
    [enriched],
  );

  const filtered = enriched.filter((c) => {
    const matchQ =
      q.trim() === "" ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.city ?? "").toLowerCase().includes(q.toLowerCase());
    const matchD = divisao === "Todas" || c.divisao === divisao;
    return matchQ && matchD;
  });

  return (
    <>
      <PageHero
        eyebrow="Nossa rede"
        title="Encontre um clube perto de você."
        description="Conheça os clubes ativos no Distrito LC-11."
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

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Carregando clubes...</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article key={c.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                  {c.divisao && (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                      Div. {c.divisao}
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.president && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Presidente</p>
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{c.president}</span>
                      </p>
                    </div>
                  )}
                  {c.city && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {c.city}
                      {c.state ? ` / ${c.state}` : ""}
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-start gap-2">
                      <Home className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{c.address}</span>
                    </p>
                  )}
                  {c.meetings && <p>📅 {c.meetings}</p>}
                  {c.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> {c.email}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Nenhum clube encontrado.</p>
        )}
      </section>
    </>
  );
}
