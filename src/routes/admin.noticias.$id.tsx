import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/noticias/$id")({
  component: NewsEditor,
});

interface Form {
  title: string;
  tag: string;
  excerpt: string;
  content: string;
  cover_url: string;
  published: boolean;
  published_at: string;
}

function NewsEditor() {
  const { id } = useParams({ from: "/admin/noticias/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>({
    title: "",
    tag: "",
    excerpt: "",
    content: "",
    cover_url: "",
    published: true,
    published_at: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            tag: data.tag ?? "",
            excerpt: data.excerpt ?? "",
            content: data.content ?? "",
            cover_url: data.cover_url ?? "",
            published: data.published,
            published_at: data.published_at?.slice(0, 10) ?? "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = { ...form, published_at: new Date(form.published_at).toISOString() };
      if (isNew) {
        const { data, error } = await supabase.from("news").insert(payload).select().single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["news"] });
        navigate({ to: "/admin/noticias/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("news").update(payload).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["news"] });
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
      const url = await uploadContentImage(file, "news");
      setForm((f) => ({ ...f, cover_url: url }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/noticias"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Notícias
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Nova notícia" : "Editar notícia"}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Categoria / tag">
            <input
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Data de publicação">
            <input
              type="date"
              value={form.published_at}
              onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
        </div>
        <F label="Resumo">
          <textarea
            rows={3}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Conteúdo">
          <textarea
            rows={10}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Publicada (visível no site)
        </label>
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
