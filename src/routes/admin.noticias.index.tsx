import { createFileRoute, Link } from "@tanstack/react-router";
import { useNews } from "@/lib/news";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/noticias/")({
  component: NewsList,
});

function NewsList() {
  const { data = [], isLoading } = useNews();
  const qc = useQueryClient();
  async function del(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) alert(error.message);
    else qc.invalidateQueries({ queryKey: ["news"] });
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Notícias</h1>
        <Link
          to="/admin/noticias/$id"
          params={{ id: "novo" }}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nova notícia
        </Link>
      </div>
      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <ul className="mt-6 divide-y rounded-md border bg-card">
          {data.map((n) => (
            <li key={n.id} className="flex items-center gap-4 p-3">
              {n.cover_url ? (
                <img src={n.cover_url} className="h-12 w-16 rounded object-cover" alt="" />
              ) : (
                <div className="h-12 w-16 rounded bg-surface" />
              )}
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(n.published_at).toLocaleDateString("pt-BR")}{" "}
                  {n.tag && <span>· {n.tag}</span>}{" "}
                  {!n.published && <span className="text-amber-600">· Rascunho</span>}
                </div>
              </div>
              <Link
                to="/admin/noticias/$id"
                params={{ id: n.id }}
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface"
              >
                <Edit className="inline h-3.5 w-3.5" /> Editar
              </Link>
              <button
                onClick={() => del(n.id, n.title)}
                className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="inline h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
