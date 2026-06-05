import { PageHero } from "@/components/PageHero";
import { MapPin, Mail } from "lucide-react";
import { useMemo } from "react";
import { useAllClubs } from "@/lib/regions";

export function ClubesPorEstado({
  estado,
  titulo,
  descricao,
}: {
  estado: "ES" | "RJ";
  titulo: string;
  descricao: string;
}) {
  const { data: clubs = [], isLoading } = useAllClubs();

  const filtered = useMemo(
    () =>
      (clubs as any[])
        .filter((c) => c.state === estado)
        .map((c) => ({
          ...c,
          divisao: c.divisions?.code ?? "",
        })),
    [clubs, estado],
  );

  return (
    <>
      <PageHero eyebrow="Nossa rede" title={titulo} description={descricao} />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando clubes...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhum clube cadastrado neste estado ainda.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                  {c.divisao && (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
                      Div. {c.divisao}
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.city && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {c.city}
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
      </section>
    </>
  );
}
