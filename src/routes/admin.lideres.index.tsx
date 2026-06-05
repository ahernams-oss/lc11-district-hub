import { createFileRoute, Link } from "@tanstack/react-router";
import { useAllLeaders, CATEGORY_LABELS, type LeaderCategory } from "@/lib/leaders";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/lideres/")({
  component: LeadersList,
});

const CATEGORY_ORDER: LeaderCategory[] = [
  "governador",
  "vice1",
  "vice2",
  "secretario",
  "tesoureiro",
  "gat",
  "assessoria",
  "ex_governador",
];

function LeadersList() {
  const { data: leaders = [], isLoading } = useAllLeaders();
  const qc = useQueryClient();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    const { error } = await supabase.from("leaders").delete().eq("id", id);
    if (error) alert("Erro: " + error.message);
    else qc.invalidateQueries({ queryKey: ["leaders"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Líderes</h1>
        <Link
          to="/admin/lideres/novo"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Adicionar líder
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 space-y-6">
          {CATEGORY_ORDER.map((cat) => {
            const list = leaders.filter((l) => l.category === cat);
            const multi = cat === "gat" || cat === "assessoria" || cat === "ex_governador";
            return (
              <section key={cat}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {CATEGORY_LABELS[cat]}
                    {multi && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({list.length} {list.length === 1 ? "membro" : "membros"})
                      </span>
                    )}
                  </h2>
                  <a
                    href={`/admin/lideres/novo?category=${cat}`}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-surface"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar {multi ? "membro" : ""}
                  </a>
                </div>
                {list.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Nenhum cadastro ainda.</p>
                ) : (
                  <ul className="mt-2 divide-y rounded-md border bg-card">
                    {list.map((l) => (
                      <li key={l.id} className="flex items-center gap-4 p-3">
                        {l.photo_url ? (
                          <img
                            src={l.photo_url}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-surface" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{l.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {l.role || l.year_label || ""}
                          </div>
                        </div>
                        <Link
                          to="/admin/lideres/$id"
                          params={{ id: l.id }}
                          className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface"
                        >
                          <Edit className="inline h-3.5 w-3.5" /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(l.id, l.name)}
                          className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="inline h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
