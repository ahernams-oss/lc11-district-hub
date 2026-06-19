import { createFileRoute, Link } from "@tanstack/react-router";
import { usePopups } from "@/lib/popups";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/popups/")({
  component: PopupsList,
});

function PopupsList() {
  const { data = [], isLoading } = usePopups();
  const qc = useQueryClient();

  async function del(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    const { error } = await (supabase as any).from("popups").delete().eq("id", id);
    if (error) alert(error.message);
    else qc.invalidateQueries({ queryKey: ["popups"] });
  }

  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Pop-ups</h1>
        <Link
          to="/admin/popups/$id"
          params={{ id: "novo" }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Novo pop-up
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : data.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhum pop-up cadastrado.</p>
      ) : (
        <ul className="mt-6 divide-y rounded-md border bg-card">
          {data.map((p) => {
            const start = new Date(p.start_at);
            const end = new Date(p.end_at);
            const isLive = p.active && start <= now && end >= now;
            const isUpcoming = p.active && start > now;
            const isExpired = end < now;
            const status = !p.active
              ? { label: "Inativo", cls: "bg-muted text-muted-foreground" }
              : isLive
                ? { label: "No ar", cls: "bg-green-100 text-green-700" }
                : isUpcoming
                  ? { label: "Agendado", cls: "bg-blue-100 text-blue-700" }
                  : isExpired
                    ? { label: "Expirado", cls: "bg-amber-100 text-amber-700" }
                    : { label: "—", cls: "bg-muted" };
            return (
              <li key={p.id} className="flex items-center gap-4 p-3">
                {p.image_url ? (
                  <img src={p.image_url} className="h-12 w-16 rounded object-cover" alt="" />
                ) : (
                  <div className="h-12 w-16 rounded bg-surface" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{p.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {start.toLocaleString("pt-BR")} → {end.toLocaleString("pt-BR")} · {p.display_seconds}s
                  </div>
                </div>
                <Link
                  to="/admin/popups/$id"
                  params={{ id: p.id }}
                  className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface"
                >
                  <Edit className="inline h-3.5 w-3.5" /> Editar
                </Link>
                <button
                  onClick={() => del(p.id, p.title)}
                  className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="inline h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
