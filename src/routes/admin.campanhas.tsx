import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { uploadContentImage } from "@/lib/leaders";
import { Plus, Trash2, Upload, Save } from "lucide-react";

export const Route = createFileRoute("/admin/campanhas")({
  component: AdminCampanhas,
});

type Row = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  meta_cents: number;
  ativo: boolean;
  ordem: number;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminCampanhas() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-campanhas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas")
        .select("id, titulo, slug, descricao, conteudo, imagem_url, meta_cents, ativo, ordem")
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-campanhas"] });

  async function criar() {
    const { error } = await supabase.from("campanhas").insert({
      titulo: "Nova campanha",
      slug: `campanha-${Date.now()}`,
      meta_cents: 0,
      ativo: false,
      ordem: rows.length,
    });
    if (error) setMsg("Erro: " + error.message);
    refresh();
  }

  async function salvar(row: Row) {
    const { id, ...payload } = row;
    const { error } = await supabase.from("campanhas").update(payload).eq("id", id);
    setMsg(error ? "Erro: " + error.message : "Salvo!");
    refresh();
  }

  async function remover(id: string) {
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("campanhas").delete().eq("id", id);
    if (error) setMsg("Erro: " + error.message);
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Campanhas de arrecadação</h1>
          <p className="text-sm text-muted-foreground">
            Causas específicas exibidas em /campanhas e na página de doação.
          </p>
        </div>
        <button
          onClick={criar}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nova campanha
        </button>
      </div>

      {msg && <p className="mt-4 text-sm font-semibold text-primary">{msg}</p>}
      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>}

      <div className="mt-6 space-y-6">
        {rows.map((row) => (
          <CampanhaCard key={row.id} row={row} onSave={salvar} onDelete={remover} />
        ))}
      </div>
    </div>
  );
}

function CampanhaCard({
  row,
  onSave,
  onDelete,
}: {
  row: Row;
  onSave: (r: Row) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<Row>(row);
  const [uploading, setUploading] = useState(false);

  async function handleImage(file: File) {
    setUploading(true);
    try {
      const url = await uploadContentImage(file);
      setForm({ ...form, imagem_url: url });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Título
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            onBlur={() => !form.slug && setForm({ ...form, slug: slugify(form.titulo) })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Slug (URL)
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Descrição curta
          <input
            value={form.descricao ?? ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Conteúdo
          <textarea
            rows={5}
            value={form.conteudo ?? ""}
            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Meta (R$)
          <input
            type="number"
            step="0.01"
            value={form.meta_cents ? form.meta_cents / 100 : ""}
            onChange={(e) =>
              setForm({ ...form, meta_cents: Math.round((parseFloat(e.target.value) || 0) * 100) })
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Ordem
          <input
            type="number"
            value={form.ordem}
            onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-normal"
          />
        </label>
        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            {form.imagem_url && (
              <img src={form.imagem_url} alt={form.titulo} className="h-20 w-32 rounded-md object-cover" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-semibold">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando…" : "Imagem da campanha"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              />
              Campanha ativa
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Save className="h-4 w-4" /> Salvar
        </button>
        <button
          onClick={() => onDelete(form.id)}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/50 px-3 py-2 text-sm font-semibold text-destructive"
        >
          <Trash2 className="h-4 w-4" /> Excluir
        </button>
      </div>
    </div>
  );
}
