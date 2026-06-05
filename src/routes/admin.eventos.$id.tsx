import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/eventos/$id")({
  component: EventEditor,
});

interface Form {
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  tag: string;
  cover_url: string;
}

function toLocalDT(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function EventEditor() {
  const { id } = useParams({ from: "/admin/eventos/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>({
    title: "",
    description: "",
    location: "",
    starts_at: "",
    ends_at: "",
    tag: "",
    cover_url: "",
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title,
            description: data.description ?? "",
            location: data.location ?? "",
            starts_at: toLocalDT(data.starts_at),
            ends_at: toLocalDT(data.ends_at),
            tag: data.tag ?? "",
            cover_url: data.cover_url ?? "",
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };
      if (isNew) {
        const { data, error } = await supabase.from("events").insert(payload).select().single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["events"] });
        navigate({ to: "/admin/eventos/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("events").update(payload).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["events"] });
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
      const url = await uploadContentImage(file, "events");
      setForm((f) => ({ ...f, cover_url: url }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/eventos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Eventos
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Novo evento" : "Editar evento"}
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
          <F label="Local">
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Início">
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Término">
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
        </div>
        <F label="Descrição">
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
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
