import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/eventos/$id")({
  component: EventEditor,
});

const MAX_GALLERY = 10;

interface Form {
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  tag: string;
  cover_url: string;
  place_info: string;
  host_club: string;
  organizer: string;
  gallery_urls: string[];
  latitude: string;
  longitude: string;
  lodging_tips: string;
  food_tips: string;
  tourism_tips: string;
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
    place_info: "",
    host_club: "",
    organizer: "",
    gallery_urls: [],
    latitude: "",
    longitude: "",
    lodging_tips: "",
    food_tips: "",
    tourism_tips: "",
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
          const d = data as any;
          setForm({
            title: d.title,
            description: d.description ?? "",
            location: d.location ?? "",
            starts_at: toLocalDT(d.starts_at),
            ends_at: toLocalDT(d.ends_at),
            tag: d.tag ?? "",
            cover_url: d.cover_url ?? "",
            place_info: d.place_info ?? "",
            host_club: d.host_club ?? "",
            organizer: d.organizer ?? "",
            gallery_urls: d.gallery_urls ?? [],
            latitude: d.latitude != null ? String(d.latitude) : "",
            longitude: d.longitude != null ? String(d.longitude) : "",
            lodging_tips: d.lodging_tips ?? "",
            food_tips: d.food_tips ?? "",
            tourism_tips: d.tourism_tips ?? "",
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
        title: form.title,
        description: form.description,
        location: form.location,
        tag: form.tag,
        cover_url: form.cover_url,
        place_info: form.place_info,
        host_club: form.host_club,
        organizer: form.organizer,
        gallery_urls: form.gallery_urls,
        lodging_tips: form.lodging_tips,
        food_tips: form.food_tips,
        tourism_tips: form.tourism_tips,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
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

  async function handleGallery(files: FileList) {
    setSaving(true);
    try {
      const remaining = MAX_GALLERY - form.gallery_urls.length;
      const toUpload = Array.from(files).slice(0, remaining);
      const urls = await Promise.all(toUpload.map((f) => uploadContentImage(f, "events")));
      setForm((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...urls].slice(0, MAX_GALLERY) }));
    } finally {
      setSaving(false);
    }
  }

  function removeGalleryImage(idx: number) {
    setForm((f) => ({ ...f, gallery_urls: f.gallery_urls.filter((_, i) => i !== idx) }));
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
          <F label="Clube anfitrião">
            <input
              value={form.host_club}
              onChange={(e) => setForm({ ...form, host_club: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Responsável pelo evento">
            <input
              value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Latitude">
            <input
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-23.5505"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
          <F label="Longitude">
            <input
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="-46.6333"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </F>
        </div>
        <F label="Descrição">
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Informações sobre o lugar">
          <textarea
            rows={4}
            value={form.place_info}
            onChange={(e) => setForm({ ...form, place_info: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label={`Fotos do lugar (até ${MAX_GALLERY})`}>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {form.gallery_urls.map((url, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute right-1 top-1 rounded bg-background/90 px-2 py-0.5 text-xs font-semibold text-foreground shadow"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          {form.gallery_urls.length < MAX_GALLERY && (
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
              <Upload className="h-4 w-4" /> Adicionar fotos ({form.gallery_urls.length}/{MAX_GALLERY})
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && e.target.files.length > 0 && handleGallery(e.target.files)}
              />
            </label>
          )}
        </F>
        <F label="Dicas de hospedagem">
          <textarea
            rows={4}
            value={form.lodging_tips}
            onChange={(e) => setForm({ ...form, lodging_tips: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Dicas gastronômicas">
          <textarea
            rows={4}
            value={form.food_tips}
            onChange={(e) => setForm({ ...form, food_tips: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </F>
        <F label="Dicas de turismo">
          <textarea
            rows={4}
            value={form.tourism_tips}
            onChange={(e) => setForm({ ...form, tourism_tips: e.target.value })}
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
