import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Calendar, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/eventos")({
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

const eventos = [
  { mes: "JUN", dia: "14", titulo: "Reunião do Gabinete Distrital", local: "Sede do Distrito — São Paulo", hora: "14h às 18h", tag: "Reunião" },
  { mes: "JUL", dia: "06", titulo: "Mutirão de Triagem Oftalmológica", local: "EMEF Vila Esperança", hora: "08h às 14h", tag: "Visão" },
  { mes: "JUL", dia: "20", titulo: "Encontro de Presidentes de Clube", local: "Hotel Central", hora: "09h às 17h", tag: "Formação" },
  { mes: "AGO", dia: "10", titulo: "Campanha Mesa Solidária", local: "Diversas praças do distrito", hora: "Dia inteiro", tag: "Fome" },
  { mes: "AGO", dia: "23", titulo: "Plantio Distrito Verde", local: "Parque Municipal", hora: "08h às 12h", tag: "Meio Ambiente" },
  { mes: "SET", dia: "07", titulo: "Caminhada pela Visão", local: "Av. Paulista", hora: "07h às 11h", tag: "Visão" },
];

function Eventos() {
  return (
    <>
      <PageHero
        eyebrow="Calendário"
        title="Próximos eventos e ações."
        description="Confira o calendário oficial do Distrito LC-11 e participe."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {eventos.map((e, i) => (
            <article key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-colors hover:border-primary sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">{e.mes}</div>
                <div className="font-display text-3xl font-bold leading-none">{e.dia}</div>
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">{e.tag}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">{e.titulo}</h3>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> {e.local}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> {e.hora}</span>
                </div>
              </div>
              <a href="#" className="inline-flex items-center gap-2 rounded-md bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-accent">
                <Calendar className="h-4 w-4" /> Adicionar
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
