import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadLeaderPhoto } from "@/lib/leaders";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/admin/grandes-leoes/novo")({
  component: BulkAddGrandesLeoes,
});

interface Entry {
  id: string; // client-side unique key
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  isUploading: boolean;
}

function BulkAddGrandesLeoes() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [entries, setEntries] = useState<Entry[]>([
    { id: crypto.randomUUID(), name: "", role: "", bio: "", photo_url: "", isUploading: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function addRow() {
    setEntries([
      ...entries,
      { id: crypto.randomUUID(), name: "", role: "", bio: "", photo_url: "", isUploading: false },
    ]);
  }

  function removeRow(id: string) {
    if (entries.length === 1) return; // keep at least one row
    setEntries(entries.filter((e) => e.id !== id));
  }

  // Allow updating individual fields on a row
  function updateEntry(id: string, field: keyof Entry, value: any) {
    setEntries(
      entries.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  async function handlePhotoUpload(id: string, file: File) {
    updateEntry(id, "isUploading", true);
    setErrorMsg(null);
    try {
      const url = await uploadLeaderPhoto(file);
      updateEntry(id, "photo_url", url);
    } catch (err: any) {
      setErrorMsg(`Erro ao enviar foto: ${err.message}`);
    } finally {
      updateEntry(id, "isUploading", false);
    }
  }

  async function handleSave() {
    // Validation
    const emptyNames = entries.some((e) => !e.name.trim());
    if (emptyNames) {
      setErrorMsg("O nome é obrigatório para todos os registros.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    // Get current order_index offset
    let maxOrder = 0;
    try {
      const { data } = await supabase
        .from("leaders")
        .select("order_index")
        .eq("category", "grande_leao")
        .order("order_index", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        maxOrder = data[0].order_index + 1;
      }
    } catch (e) {
      console.error(e);
    }

    const payload = entries.map((entry, idx) => ({
      category: "grande_leao",
      name: entry.name.trim(),
      role: entry.role.trim() || null,
      bio: entry.bio.trim() || null,
      photo_url: entry.photo_url.trim() || null,
      order_index: maxOrder + idx,
    }));

    try {
      const { error } = await supabase.from("leaders").insert(payload);
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

  return (
    <div className="max-w-4xl pb-16">
      <Link
        to="/admin/grandes-leoes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para listagem
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
        Adicionar Vários Grandes Leões
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Preencha os campos abaixo para cadastrar múltiplos Grandes Leões de uma vez.
      </p>

      {errorMsg && (
        <div className="mt-6 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="relative rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground/60 uppercase">
                Leão #{index + 1}
              </span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(entry.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="Remover este Leão"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-[140px_1fr] items-start mt-4 sm:mt-0">
              {/* Upload da Foto */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-semibold text-muted-foreground mb-2 self-start md:self-center">Visualização</span>
                {entry.photo_url ? (
                  <div className="relative group h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/10">
                    <img src={entry.photo_url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => updateEntry(entry.id, "photo_url", "")}
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
                  {entry.isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>Enviar arquivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={entry.isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(entry.id, file);
                    }}
                  />
                </label>
              </div>

              {/* Campos de texto */}
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Nome *</label>
                    <input
                      type="text"
                      required
                      value={entry.name}
                      onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                      placeholder="Nome do Grande Leão"
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Cargo / Título / Crachá</label>
                    <input
                      type="text"
                      value={entry.role}
                      onChange={(e) => updateEntry(entry.id, "role", e.target.value)}
                      placeholder="Ex: Fundador, Cavaleiro dos Cegos, AL 2026-2027"
                      className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">URL da Foto (Cole um link externo ou use o botão ao lado)</label>
                  <input
                    type="text"
                    value={entry.photo_url}
                    onChange={(e) => updateEntry(entry.id, "photo_url", e.target.value)}
                    placeholder="Ex: https://exemplo.com/foto.jpg"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Biografia / Descrição</label>
                  <textarea
                    rows={3}
                    value={entry.bio}
                    onChange={(e) => updateEntry(entry.id, "bio", e.target.value)}
                    placeholder="Escreva uma breve biografia ou descrição dos feitos leonísticos deste membro..."
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-4">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-surface transition-colors"
          >
            <Plus className="h-4 w-4" /> Adicionar Outro Leão
          </button>

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
                  <Save className="h-4 w-4" /> Salvar Todos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
