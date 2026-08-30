import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useDocumentCategories,
  slugifyCategory,
  buildCategoryTree,
  flattenCategoryTree,
  type DocumentCategory,
  type CategoryNode,
} from "@/lib/documents";
import { ArrowLeft, Plus, Save, Trash2, Tag, Eye, EyeOff, FolderTree } from "lucide-react";

export const Route = createFileRoute("/admin/documentos/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const { data: categories = [], isLoading } = useDocumentCategories({ includeInactive: true });
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [novo, setNovo] = useState({ label: "", slug: "", sort_order: 0, parent_id: "" });

  const ordered = useMemo(
    () => flattenCategoryTree(buildCategoryTree(categories)),
    [categories],
  );


  const field =
    "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary";

  function refresh() {
    qc.invalidateQueries({ queryKey: ["document-categories"] });
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    const label = novo.label.trim();
    if (!label) return;
    const slug = slugifyCategory(novo.slug || label);
    if (!slug) {
      alert("Informe um identificador válido.");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any)
      .from("document_categories")
      .insert({ label, slug, sort_order: Number(novo.sort_order) || 0 });
    setSaving(false);
    if (error) {
      alert(error.message);
      return;
    }
    setNovo({ label: "", slug: "", sort_order: 0 });
    refresh();
  }

  async function atualizar(c: DocumentCategory, patch: Partial<DocumentCategory>) {
    const { error } = await (supabase as any)
      .from("document_categories")
      .update(patch)
      .eq("id", c.id);
    if (error) alert(error.message);
    else refresh();
  }

  async function excluir(c: DocumentCategory) {
    const { count } = await (supabase as any)
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("category", c.slug);
    if ((count ?? 0) > 0) {
      alert(
        `Não é possível excluir: existem ${count} documento(s) nesta categoria. Mova-os ou desative a categoria.`,
      );
      return;
    }
    if (!confirm(`Excluir a categoria "${c.label}"?`)) return;
    const { error } = await (supabase as any).from("document_categories").delete().eq("id", c.id);
    if (error) alert(error.message);
    else refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            to="/admin/documentos"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Documentos
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold">Categorias de Documentos</h1>
          <p className="text-xs text-muted-foreground">
            Cadastre, renomeie, ordene ou desative as categorias usadas nos documentos do distrito.
          </p>
        </div>
      </div>

      <form onSubmit={criar} className="mt-6 rounded-md border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4 text-primary" /> Nova categoria
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_2fr_auto_auto]">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-muted-foreground">Nome *</label>
            <input
              className={field}
              value={novo.label}
              onChange={(e) => setNovo({ ...novo, label: e.target.value })}
              placeholder="Ex: Atos do(a) Governador(a) — AL 2029-2030"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-muted-foreground">
              Identificador (opcional)
            </label>
            <input
              className={field}
              value={novo.slug}
              onChange={(e) => setNovo({ ...novo, slug: e.target.value })}
              placeholder={novo.label ? slugifyCategory(novo.label) : "gerado automaticamente"}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase text-muted-foreground">Ordem</label>
            <input
              type="number"
              className={`${field} w-24`}
              value={novo.sort_order}
              onChange={(e) => setNovo({ ...novo, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-md border bg-card">
          <ul className="divide-y">
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} onSave={atualizar} onDelete={excluir} />
            ))}
            {categories.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">Nenhuma categoria cadastrada.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onSave,
  onDelete,
}: {
  category: DocumentCategory;
  onSave: (c: DocumentCategory, patch: Partial<DocumentCategory>) => void;
  onDelete: (c: DocumentCategory) => void;
}) {
  const [label, setLabel] = useState(category.label);
  const [order, setOrder] = useState(category.sort_order);
  const dirty = label !== category.label || order !== category.sort_order;

  return (
    <li className="flex flex-wrap items-center gap-3 p-3">
      <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        className="min-w-[200px] flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        type="number"
        className="w-20 rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        value={order}
        onChange={(e) => setOrder(Number(e.target.value))}
        title="Ordem de exibição"
      />
      <code className="hidden max-w-[220px] truncate rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground md:block">
        {category.slug}
      </code>
      <button
        onClick={() => onSave(category, { active: !category.active })}
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs ${
          category.active ? "text-foreground hover:bg-surface" : "text-muted-foreground"
        }`}
        title={category.active ? "Desativar" : "Ativar"}
      >
        {category.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {category.active ? "Ativa" : "Inativa"}
      </button>
      <button
        disabled={!dirty}
        onClick={() => onSave(category, { label: label.trim(), sort_order: order })}
        className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold hover:bg-surface disabled:opacity-40"
      >
        <Save className="h-3.5 w-3.5" /> Salvar
      </button>
      <button
        onClick={() => onDelete(category)}
        className="rounded-md border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
