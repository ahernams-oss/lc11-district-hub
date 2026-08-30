import { createFileRoute, Link } from "@tanstack/react-router";
import { useDocuments, useDocumentCategories } from "@/lib/documents";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText, ExternalLink, ShieldCheck, Lock, Tag } from "lucide-react";


export const Route = createFileRoute("/admin/documentos/")({
  component: DocumentsList,
});

function DocumentsList() {
  const { data = [], isLoading } = useDocuments();
  const { data: categories = [] } = useDocumentCategories({ includeInactive: true });
  const qc = useQueryClient();


  async function del(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    const { error } = await (supabase as any).from("documents").delete().eq("id", id);
    if (error) alert(error.message);
    else qc.invalidateQueries({ queryKey: ["documents"] });
  }

  const byCategory = categories.map((c) => ({
    ...c,
    items: data.filter((d) => d.category === c.slug),
  }));


  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Documentos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gerencie os documentos públicos e restritos do distrito.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/documentos/categorias"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface"
          >
            <Tag className="h-4 w-4 text-primary" /> Categorias
          </Link>
          <Link
            to="/admin/documentos/auditoria"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface"
          >
            <ShieldCheck className="h-4 w-4 text-primary" /> Trilha de Auditoria
          </Link>

          <Link
            to="/admin/documentos/$id"
            params={{ id: "novo" }}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow"
          >
            <Plus className="h-4 w-4" /> Novo documento
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 space-y-6">
          {byCategory.map((c) => (
            <section key={c.slug} className="rounded-md border bg-card">
              <header className="border-b px-4 py-2">
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.items.length} documento(s)</div>
              </header>
              {c.items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum documento.</p>
              ) : (
                <ul className="divide-y">
                  {c.items.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 p-3">
                      <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold">{d.title}</span>
                          {d.is_restricted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              <Lock className="h-3 w-3" /> Restrito ({d.required_role || "membro"})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>#{d.sort_order}</span>
                          {d.file_url && <span>arquivo</span>}
                          {d.external_url && (
                            <span className="inline-flex items-center gap-1">
                              link <ExternalLink className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to="/admin/documentos/$id"
                        params={{ id: d.id }}
                        className="rounded-md border px-3 py-1.5 text-xs hover:bg-surface"
                      >
                        <Edit className="inline h-3.5 w-3.5" /> Editar
                      </Link>
                      <button
                        onClick={() => del(d.id, d.title)}
                        className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="inline h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

