import { createFileRoute, Link } from "@tanstack/react-router";
import { useLeaders } from "@/lib/leaders";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, Award, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/grandes-leoes/")({
  component: GrandesLeoesList,
});

function GrandesLeoesList() {
  const { data: leaders = [], isLoading } = useLeaders("grande_leao");
  const qc = useQueryClient();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o Grande Leão "${name}"?`)) return;
    const { error } = await supabase.from("leaders").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      qc.invalidateQueries({ queryKey: ["leaders", "grande_leao"] });
      qc.invalidateQueries({ queryKey: ["leaders", "all"] });
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Grandes Leões
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os Grandes Leões exibidos na página pública.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/grandes-leoes/novo"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" /> Adicionar Vários
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-8">
          {leaders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Nenhum Grande Leão cadastrado</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Cadastre os destaques leonísticos para exibi-los na página pública do site. Atualmente, a página está exibindo os dados estáticos de fallback (Melvin Jones, Helen Keller, etc.).
              </p>
              <Link
                to="/admin/grandes-leoes/novo"
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-deep"
              >
                <Plus className="h-4 w-4" /> Começar Cadastro
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <ul className="divide-y divide-border">
                {leaders.map((l) => (
                  <li key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-surface/35 transition-colors">
                    {l.photo_url ? (
                      <img
                        src={l.photo_url}
                        alt={l.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Award className="h-8 w-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-lg font-bold text-foreground truncate">{l.name}</h4>
                        {l.year_label && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {l.year_label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary mt-0.5">{l.role || "Grande Leão"}</p>
                      {l.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                          {l.bio}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <Link
                        to="/admin/grandes-leoes/$id"
                        params={{ id: l.id }}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-surface"
                      >
                        <Edit className="h-3.5 w-3.5" /> Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(l.id, l.name)}
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
