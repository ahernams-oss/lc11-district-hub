import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DOCUMENT_CATEGORIES, type DocumentItem } from "@/lib/documents";
import { uploadDocumentFile } from "@/lib/documents.functions";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X } from "lucide-react";

export const Route = createFileRoute("/admin/documentos/$id")({
  component: DocumentEdit,
});

function DocumentEdit() {
  const { id } = Route.useParams();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const doUpload = useServerFn(uploadDocumentFile);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    category: DOCUMENT_CATEGORIES[0].slug,
    title: "",
    description: "",
    file_url: "",
    external_url: "",
    sort_order: 0,
  });

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        alert(error.message);
        return;
      }
      const d = data as DocumentItem;
      setForm({
        category: d.category,
        title: d.title,
        description: d.description ?? "",
        file_url: d.file_url ?? "",
        external_url: d.external_url ?? "",
        sort_order: d.sort_order,
      });
      setLoading(false);
    })();
  }, [id, isNew]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return alert("Título é obrigatório");
    if (!form.file_url && !form.external_url)
      return alert("Adicione um arquivo OU um link externo");

    setSaving(true);
    const payload = {
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim() || null,
      file_url: form.file_url || null,
      external_url: form.external_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = isNew
      ? await (supabase as any).from("documents").insert(payload)
      : await (supabase as any).from("documents").update(payload).eq("id", id);
    setSaving(false);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["documents"] });
    navigate({ to: "/admin/documentos" });
  }

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  const field = "w-full rounded-md border bg-background px-3 py-2 text-sm";
  const label = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">
        {isNew ? "Novo documento" : "Editar documento"}
      </h1>
      <form onSubmit={save} className="mt-6 grid max-w-2xl gap-4">
        <div>
          <label className={label}>Categoria *</label>
          <select
            className={field}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Título *</label>
          <input
            className={field}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>Descrição</label>
          <textarea
            className={field}
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>Arquivo (PDF, DOC, XLS, imagem...)</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  await new Promise<void>((res, rej) => {
                    reader.onload = () => res();
                    reader.onerror = () => rej(reader.error);
                  });
                  const result = await doUpload({
                    data: { file: reader.result as string, filename: file.name },
                  });
                  setForm((p) => ({ ...p, file_url: result.url }));
                } catch (err: any) {
                  alert(err?.message || "Erro ao enviar arquivo");
                } finally {
                  setUploading(false);
                  if (fileRef.current) fileRef.current.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-surface disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Escolher arquivo"}
            </button>
            {form.file_url && (
              <>
                <a
                  href={form.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-primary underline"
                >
                  Visualizar
                </a>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, file_url: "" }))}
                  className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Remover
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className={label}>Ou link externo (URL)</label>
          <input
            className={field}
            value={form.external_url}
            onChange={(e) => setForm({ ...form, external_url: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className={label}>Ordem (menor aparece primeiro)</label>
          <input
            type="number"
            className={field}
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          />
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
            onClick={() => navigate({ to: "/admin/documentos" })}
            className="rounded-md border px-5 py-2 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
