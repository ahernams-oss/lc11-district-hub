import { Link } from "@tanstack/react-router";
import { useEvents } from "@/lib/events";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventYearLinks } from "@/components/EventYearLinks";
import { eventsForYear } from "@/lib/event-years";

export function AdminEventYearPage({ year }: { year: string }) {
  const { data: all = [], isLoading, error } = useEvents();
  const data = eventsForYear(all, year);
  const qc = useQueryClient();
  async function del(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) alert(error.message);
    else qc.invalidateQueries({ queryKey: ["events"] });
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Eventos · AL {year}</h1>
        <Link
          to="/admin/eventos/$id"
          params={{ id: "novo" }}
          search={{ ano: year.replace("/", "-") }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Novo evento
        </Link>
      </div>
      <EventYearLinks year={year} admin />
      {error ? <p className="text-destructive">Não foi possível carregar os eventos.</p> : isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <ul className="mt-6 divide-y rounded-md border bg-card">
          {data.length === 0 && <li className="p-4 text-muted-foreground">Nenhum evento cadastrado neste ano leonístico.</li>}
          {data.map((e) => (
            <li key={e.id} className="flex items-center gap-4 p-3">
              <div className="flex-1">
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-muted-foreground">
                  {e.starts_at && new Date(e.starts_at).toLocaleString("pt-BR")}
                  {e.location && ` · ${e.location}`}
                </div>
              </div>
              <Link
                to="/admin/eventos/$id"
                params={{ id: e.id }}
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface"
              >
                <Edit className="inline h-3.5 w-3.5" /> Editar
              </Link>
              <Button
                variant="outline" size="icon" aria-label={`Excluir ${e.title}`}
                onClick={() => del(e.id, e.title)}
                className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="inline h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
