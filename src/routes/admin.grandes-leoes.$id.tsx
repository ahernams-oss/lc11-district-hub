import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadLeaderPhoto } from "@/lib/leaders";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, Save } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";

export const Route = createFileRoute("/admin/grandes-leoes/$id")({
  component: GrandeLeaoEditor,
});

interface FormState {
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  year_label: string;
  order_index: number;
}

const EMPTY: FormState = {
  name: "",
  role: "",
  bio: "",
  photo_url: "",
  year_label: "Grande Leão",
  order_index: 0,
};

function GrandeLeaoEditor() {
  const { id } = useParams({ from: "/admin/grandes-leoes/$id" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cropModal, setCropModal] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("leaders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg("Erro ao carregar dados: " + error.message);
        } else if (data) {
          setForm({
            name: data.name ?? "",
            role: data.role ?? "",
            bio: data.bio ?? "",
            photo_url: data.photo_url ?? "",
            year_label: data.year_label ?? "Grande Leão",
            order_index: data.order_index ?? 0,
          });
        } else {
          setErrorMsg("Registro não encontrado.");
        }
        setLoading(false);
      });
  }, [id]);

  async function handlePhotoUpload(file: File) {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const url = await uploadLeaderPhoto(file);
      setForm((f) => ({ ...f, photo_url: url }));
    } catch (err: any) {
      setErrorMsg(`Erro ao enviar foto: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setErrorMsg("O nome é obrigatório.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      year_label: form.year_label.trim() || null,
      order_index: form.order_index,
    };

    try {
      const { error } = await supabase
        .from("leaders")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      qc.invalidateQueries({ queryKey: ["leaders", "grande_leao"] });
      qc.invalidateQueries({ queryKey: ["leaders", "all"] });
      navigate({ to: "/admin/grandes-leoes" });
    } catch (err: any) {
      setErrorMsg(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground p-4">Carregando dados...</p>;
  }

  return (
    <div className="max-w-2xl pb-16">
      <Link
        to="/admin/grandes-leoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para listagem
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
        Editar Grande Leão
      </h1>

      {errorMsg && (
        <div className="mt-6 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[140px_1fr] items-start">
            {/* Foto Upload */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground mb-2 self-start md:self-center">Visualização</span>
              {form.photo_url ? (
                <div className="relative group h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/10">
                  <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photo_url: "" }))}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-xs font-semibold">Sem foto</span>
                </div>
              )}
              <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-surface w-full justify-center">
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Enviar arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCropModal(URL.createObjectURL(file));
                  }}
                />
              </label>
            </div>

            {/* Inputs */}
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Cargo / Título</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Crachá / Categoria (Badge)</label>
                  <input
                    type="text"
                    value={form.year_label}
                    onChange={(e) => setForm({ ...form, year_label: e.target.value })}
                    placeholder="Ex: Fundador, Destaque"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Índice de Ordenação</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">URL da Foto (Cole um link externo ou use o botão de envio)</label>
                <input
                  type="text"
                  value={form.photo_url}
                  onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="Ex: https://exemplo.com/sua-foto.jpg"
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Biografia / Descrição</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Link
            to="/admin/grandes-leoes"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-surface transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary-deep disabled:opacity-60 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      {cropModal && (
        <ImageCropModal
          imageUrl={cropModal}
          aspect={1}
          cropShape="round"
          onClose={() => {
            URL.revokeObjectURL(cropModal);
            setCropModal(null);
          }}
          onConfirm={(file) => {
            URL.revokeObjectURL(cropModal);
            setCropModal(null);
            handlePhotoUpload(file);
          }}
        />
      )}
    </div>
  );
}
