import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Popup } from "@/lib/popups";
import { uploadPopupImage } from "@/lib/popups.functions";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/admin/popups/$id")({
  component: PopupEdit,
});

// datetime-local expects "YYYY-MM-DDTHH:mm" in local time
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string {
  return new Date(v).toISOString();
}

function PopupEdit() {
  const { id } = Route.useParams();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const doUpload = useServerFn(uploadPopupImage);

  const [form, setForm] = useState({
    title: "",
    content: "",
    image_url: "",
    link_url: "",
    link_label: "",
    start_at: toLocalInput(new Date().toISOString()),
    end_at: toLocalInput(new Date(Date.now() + 7 * 24 * 3600_000).toISOString()),
    display_seconds: 0,
    active: true,
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await (supabase as any).from("popups").select("*").eq("id", id).single();
      if (error) {
        alert(error.message);
        return;
      }
      const p = data as Popup;
      setForm({
        title: p.title,
        content: p.content ?? "",
        image_url: p.image_url ?? "",
        link_url: p.link_url ?? "",
        link_label: p.link_label ?? "",
        start_at: toLocalInput(p.start_at),
        end_at: toLocalInput(p.end_at),
        display_seconds: p.display_seconds,
        active: p.active,
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Título é obrigatório");
    if (!form.start_at || !form.end_at) return alert("Datas obrigatórias");
    if (new Date(form.end_at) <= new Date(form.start_at))
      return alert("A data de término deve ser maior que o início");

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim() || null,
      image_url: form.image_url.trim() || null,
      link_url: form.link_url.trim() || null,
      link_label: form.link_label.trim() || null,
      start_at: fromLocalInput(form.start_at),
      end_at: fromLocalInput(form.end_at),
      display_seconds: Number(form.display_seconds) || 0,
      active: form.active,
    };
    const { error } = isNew
      ? await (supabase as any).from("popups").insert(payload)
      : await (supabase as any).from("popups").update(payload).eq("id", id);
    setSaving(false);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["popups"] });
    navigate({ to: "/admin/popups" });
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  const field = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const label = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{isNew ? "Novo pop-up" : "Editar pop-up"}</h1>
      <form onSubmit={save} className="mt-6 grid max-w-2xl gap-4">
        <div>
          <label className={label}>Título *</label>
          <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className={label}>Mensagem</label>
          <textarea
            className={field}
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div>
          <label className={label}>Imagem</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                try {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  await new Promise<void>((resolve, reject) => {
                    reader.onload = () => resolve();
                    reader.onerror = () => reject(reader.error);
                  });
                  const base64 = reader.result as string;
                  const res = await doUpload({ data: { file: base64, filename: file.name } });
                  setForm((prev) => ({ ...prev, image_url: res.url }));
                } catch (err: any) {
                  alert(err?.message || "Erro ao enviar imagem");
                } finally {
                  setUploadingImage(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-surface disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploadingImage ? "Enviando..." : "Escolher imagem"}
            </button>
            {form.image_url && (
              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, image_url: "" }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <X className="h-3 w-3" /> Remover
              </button>
            )}
          </div>
          {form.image_url && (
            <img
              src={form.image_url}
              alt="Preview"
              className="mt-3 h-32 w-auto rounded-md border object-cover"
            />
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Link (URL)</label>
            <input
              className={field}
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={label}>Texto do botão</label>
            <input
              className={field}
              value={form.link_label}
              onChange={(e) => setForm({ ...form, link_label: e.target.value })}
              placeholder="Saiba mais"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Início *</label>
            <input
              type="datetime-local"
              className={field}
              value={form.start_at}
              onChange={(e) => setForm({ ...form, start_at: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Término *</label>
            <input
              type="datetime-local"
              className={field}
              value={form.end_at}
              onChange={(e) => setForm({ ...form, end_at: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Tempo de exposição (segundos)</label>
            <input
              type="number"
              min={0}
              className={field}
              value={form.display_seconds}
              onChange={(e) => setForm({ ...form, display_seconds: Number(e.target.value) })}
            />
            <p className="mt-1 text-xs text-muted-foreground">0 = fica aberto até o usuário fechar.</p>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Ativo
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/popups" })}
            className="rounded-md border px-5 py-2 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
