import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Calendar, MapPin, Clock } from "lucide-react";
import { useEvents } from "@/lib/events";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos — Distrito LC-11" },
      { name: "description", content: "Calendário de eventos, encontros e ações do Distrito LC-11." },
      { property: "og:title", content: "Eventos — Distrito LC-11" },
      { property: "og:description", content: "Próximos eventos do Distrito LC-11." },
      { property: "og:url", content: "/eventos" },
    ],
    links: [{ rel: "canonical", href: "/eventos" }],
  }),
  component: Eventos,
});

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function Eventos() {
  const { data = [], isLoading } = useEvents();
  const now = Date.now();
  return (
    <>
      <PageHero
        eyebrow="Calendário"
        title="Próximos eventos e ações."
        description="Confira o calendário oficial do Distrito LC-11 e participe."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {data.map((e) => {
              const d = e.starts_at ? new Date(e.starts_at) : null;
              const endD = e.ends_at ? new Date(e.ends_at) : null;
              const ended = (endD ?? d) ? (endD ?? d)!.getTime() < now : false;
              const mes = d ? MESES[d.getMonth()] : "—";
              const dia = d ? String(d.getDate()).padStart(2, "0") : "—";
              const hora = d
                ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <Link
                  to="/eventos/$id"
                  params={{ id: e.id }}
                  key={e.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary sm:flex-row sm:items-center"
                >
                  <div className={`flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg text-primary-foreground ${ended ? "bg-muted-foreground" : "bg-primary"}`}>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                      {mes}
                    </div>
                    <div className="font-display text-3xl font-bold leading-none">{dia}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {e.tag && (
                        <span className="inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                          {e.tag}
                        </span>
                      )}
                      {ended && (
                        <span className="inline-block rounded-full bg-destructive/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-destructive">
                          Encerrado
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold text-foreground">{e.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" /> {e.location}
                        </span>
                      )}
                      {hora && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" /> {hora}
                        </span>
                      )}
                    </div>
                    {e.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
                    )}
                  </div>
                  <Calendar className="hidden h-5 w-5 text-muted-foreground sm:block" />
                </Link>
              );
            })}
            {data.length === 0 && (
              <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
