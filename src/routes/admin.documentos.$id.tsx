import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DOCUMENT_CATEGORIES, useDocumentCategories, type DocumentItem } from "@/lib/documents";
import { uploadDocumentFile } from "@/lib/documents.functions";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X, Eye, EyeOff, FileText, ExternalLink, Download, Maximize2, Sparkles, Lock, ShieldCheck } from "lucide-react";

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
  const { data: categories = [] } = useDocumentCategories();



  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [fullscreenViewer, setFullscreenViewer] = useState(false);
  const [form, setForm] = useState<{
    category: string;
    title: string;
    description: string;
    file_url: string;
    external_url: string;
    sort_order: number;
    is_restricted: boolean;
    required_role: "membro" | "diretoria" | "admin";
  }>({
    category: DOCUMENT_CATEGORIES[0].slug,
    title: "",
    description: "",
    file_url: "",
    external_url: "",
    sort_order: 0,
    is_restricted: false,
    required_role: "membro",
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
        is_restricted: !!d.is_restricted,
        required_role: d.required_role || "membro",
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
      is_restricted: form.is_restricted,
      required_role: form.required_role,
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

  const field = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none";
  const label = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  const selectedCategoryLabel =
    categories.find((c) => c.slug === form.category)?.label ?? form.category;

  const docUrl = form.file_url || form.external_url;
  const isImage = form.file_url && /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(form.file_url);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {isNew ? "Novo documento" : "Editar documento"}
          </h1>
          <p className="text-xs text-muted-foreground">Preencha as informações do documento e visualize como será exibido no site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showPreview
                ? "bg-primary/10 border-primary/30 text-primary"
                : "hover:bg-surface text-muted-foreground"
            }`}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? "Ocultar Modo de Visualização" : "Ativar Modo de Visualização"}
          </button>
        </div>
      </div>

      <div className={`mt-6 grid gap-8 ${showPreview ? "lg:grid-cols-2" : "max-w-2xl"}`}>
        {/* Form Column */}
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className={label}>Categoria *</label>
            <select
              className={field}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
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
              placeholder="Ex: Estatuto Social AL 2026-2027"
            />
          </div>

          <div>
            <label className={label}>Descrição</label>
            <textarea
              className={field}
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Breve resumo ou instruções sobre o documento..."
            />
          </div>

          <div>
            <label className={label}>Arquivo (PDF, DOC, XLS, imagem...)</label>
            <div className="mt-1 flex items-center gap-3">
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

          {/* Sensitivity & Access Control Section */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
              <Lock className="h-4 w-4" />
              <span>Controle de Acesso & Documento Sensível</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.is_restricted}
                onChange={(e) => setForm({ ...form, is_restricted: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-amber-500 text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground">Documento Sensível / Restrito 🔒</span>
                <p className="text-muted-foreground mt-0.5">
                  Exige que o visitante esteja autenticado no <strong>Portal de Membros</strong> para visualizar ou baixar.
                </p>
              </div>
            </label>

            {form.is_restricted && (
              <div className="pt-2 border-t border-amber-500/20">
                <label className={label}>Perfil mínimo exigido para acesso</label>
                <select
                  className={`${field} mt-1 border-amber-500/40 bg-background`}
                  value={form.required_role}
                  onChange={(e) =>
                    setForm({ ...form, required_role: e.target.value as "membro" | "diretoria" | "admin" })
                  }
                >
                  <option value="membro">Membros Leão (Qualquer conta logada)</option>
                  <option value="diretoria">Diretoria & Painel (Intermediário ou superior)</option>
                  <option value="admin">Administradores (Controle Total)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 shadow"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/admin/documentos" })}
              className="rounded-md border px-5 py-2 text-sm hover:bg-surface"
            >
              Cancelar
            </button>
          </div>
        </form>

        {/* Live Visual Preview Panel */}
        {showPreview && (
          <div className="space-y-6 rounded-xl border bg-muted/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Modo de Visualização ao Vivo
                </h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Ativo
              </span>
            </div>

            {/* Public Card Preview */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Como o card aparece no site:</span>
              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-start">
                <FileText className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {selectedCategoryLabel}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-foreground">
                    {form.title || "Título do Documento"}
                  </h3>
                  {form.description ? (
                    <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                      {form.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs italic text-muted-foreground/60">Sem descrição adicional.</p>
                  )}
                </div>
                <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  {form.external_url && !form.file_url ? (
                    <>Abrir <ExternalLink className="h-3.5 w-3.5" /></>
                  ) : (
                    <>Baixar <Download className="h-3.5 w-3.5" /></>
                  )}
                </div>
              </div>
            </div>

            {/* Embedded Document/File Previewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Pré-visualização do Conteúdo:</span>
                {docUrl && (
                  <button
                    type="button"
                    onClick={() => setFullscreenViewer(true)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Maximize2 className="h-3 w-3" /> Expandir visualizador
                  </button>
                )}
              </div>

              {!docUrl ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-card/60 p-6 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    Anexe um arquivo ou insira um link externo para pré-visualizar o conteúdo.
                  </p>
                </div>
              ) : isImage ? (
                <div className="overflow-hidden rounded-lg border bg-card p-2">
                  <img src={docUrl} alt="Visualização do documento" className="max-h-80 w-full object-contain rounded" />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg border bg-card shadow-inner">
                  <iframe
                    src={docUrl}
                    title="Visualização do documento"
                    className="h-80 w-full border-0"
                  />
                  <div className="border-t bg-muted/40 px-3 py-2 text-right">
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Abrir em nova aba <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Viewer Modal */}
      {fullscreenViewer && docUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex h-[90vh] w-[95vw] max-w-6xl flex-col rounded-xl bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-display font-semibold">{form.title || "Visualização do Documento"}</span>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenViewer(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-muted/20 p-2">
              {isImage ? (
                <div className="flex h-full items-center justify-center">
                  <img src={docUrl} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <iframe src={docUrl} title="Visualizador" className="h-full w-full rounded border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

