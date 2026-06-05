import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/projetos/$id")({
  component: ProjectEditor,
});

interface Form {
  title: string;
  tag: string;
  description: string;
  content: string;
  cover_url: string;
  order_index: number;
}

function ProjectEditor() {
  const { id } = useParams({ from: "/admin/projetos/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>({
    title: "",
    tag: "",
    description: "",
    content: "",
    cover_url: "",
    order_index: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            tag: data.tag ?? "",
            description: data.description ?? "",
            content: data.content ?? "",
            cover_url: data.cover_url ?? "",
            order_index: data.order_index ?? 0,
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      if (isNew) {
        const { data, error } = await supabase.from("projects").insert(form).select().single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["projects"] });
        navigate({ to: "/admin/projetos/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("projects").update(form).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["projects"] });
        setMsg("Salvo!");
      }
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCover(file: File) {
    setSaving(true);
    try {
      const url = await uploadContentImage(file, "projects");
      setForm((f) => ({ ...f, cover_url: url }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/projetos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Projetos
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Novo projeto" : "Editar projeto"}
      </h1>
      <div className="mt-6 space-y-4">
        <F label="Imagem de capa">
          {form.cover_url && (
            <img src={form.cover_url} className="mb-2 h-32 rounded-md object-cover" alt="" />
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
            <Upload className="h-4 w-4" /> Enviar imagem
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCover(e.target.files[0])}
            />
          </label>
        </F>
        <F label="Título *">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Categoria / tag">
          <input
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Ex.: Visão, Fome, Meio Ambiente"
          />
        </F>
        <F label="Descrição curta">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Conteúdo completo">
          <textarea
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Ordem">
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
            className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving || !form.title}
            className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
