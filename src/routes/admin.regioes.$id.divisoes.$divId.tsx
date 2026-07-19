import { createFileRoute, Link, Outlet, useChildMatches, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useClubs, useRegion } from "@/lib/regions";
import { uploadLeaderPhoto } from "@/lib/leaders";
import { ArrowLeft, Plus, Trash2, ChevronRight, Upload } from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";

export const Route = createFileRoute("/admin/regioes/$id/divisoes/$divId")({
  component: DivisionRoute,
});

function DivisionRoute() {
  const childMatches = useChildMatches();
  if (childMatches.length > 0) return <Outlet />;
  return <DivisionEditor />;
}

interface Form {
  code: string;
  name: string;
  description: string;
  order_index: number;
  president_name: string;
  president_photo_url: string;
}
const EMPTY: Form = {
  code: "",
  name: "",
  description: "",
  order_index: 0,
  president_name: "",
  president_photo_url: "",
};

function DivisionEditor() {
  const { id, divId } = useParams({ from: "/admin/regioes/$id/divisoes/$divId" });
  const isNew = divId === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: region } = useRegion(id);
  const { data: clubs = [] } = useClubs(isNew ? undefined : divId);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("divisions")
      .select("*")
      .eq("id", divId)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setForm({
            code: data.code,
            name: data.name,
            description: data.description ?? "",
            order_index: data.order_index ?? 0,
            president_name: (data as any).president_name ?? "",
            president_photo_url: (data as any).president_photo_url ?? "",
          });
        setLoading(false);
      });
  }, [divId, isNew]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("divisions")
          .insert({ ...form, region_id: id })
          .select()
          .single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["divisions"] });
        navigate({ to: "/admin/regioes/$id/divisoes/$divId", params: { id, divId: data.id } });
      } else {
        const { error } = await supabase.from("divisions").update(form).eq("id", divId);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["divisions"] });
        setMsg("Salvo!");
      }
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir esta divisão? Todos os clubes vinculados também serão excluídos.")) return;
    const { error } = await supabase.from("divisions").delete().eq("id", divId);
    if (error) return alert("Erro: " + error.message);
    qc.invalidateQueries({ queryKey: ["divisions"] });
    navigate({ to: "/admin/regioes/$id", params: { id } });
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-4xl">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/regioes" className="hover:text-primary">
          Regiões
        </Link>
        <span>/</span>
        <Link to="/admin/regioes/$id" params={{ id }} className="hover:text-primary">
          {region?.name ?? "Região"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{isNew ? "Nova divisão" : form.code}</span>
      </nav>
      <Link
        to="/admin/regioes/$id"
        params={{ id }}
        className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar à região
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Nova divisão" : `Divisão ${form.code}`}
      </h1>

      <div className="mt-6 space-y-4 rounded-md border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <Field label="Código *">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              placeholder="Ex.: A1"
            />
          </Field>
          <Field label="Nome *">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
        </div>
        <Field label="Descrição">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>
        <Field label="Presidente da Divisão">
          <input
            value={form.president_name}
            onChange={(e) => setForm({ ...form, president_name: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>
        <Field label="Foto do Presidente">
          <div className="mt-1 flex items-center gap-4">
            {form.president_photo_url ? (
              <img
                src={form.president_photo_url}
                alt="Presidente"
                className="h-20 w-20 rounded-full border object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full border border-dashed bg-muted" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
              <Upload className="h-4 w-4" />
              {form.president_photo_url ? "Trocar foto" : "Enviar foto"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setCropUrl(reader.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
            </label>
            {form.president_photo_url && (
              <button
                type="button"
                onClick={() => setForm({ ...form, president_photo_url: "" })}
                className="text-sm text-destructive hover:underline"
              >
                Remover
              </button>
            )}
          </div>
        </Field>
        <Field label="Ordem">
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
            className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.code || !form.name}
            className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="inline h-4 w-4" /> Excluir divisão
            </button>
          )}
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>

      {!isNew && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Clubes desta divisão</h2>
            <Link
              to="/admin/regioes/$id/divisoes/$divId/clubes/$clubId"
              params={{ id, divId, clubId: "novo" }}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Novo clube
            </Link>
          </div>
          {clubs.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum clube cadastrado.</p>
          ) : (
            <ul className="mt-3 divide-y rounded-md border bg-card">
              {clubs.map((c) => (
                <li key={c.id} className="flex items-center gap-2 p-3 hover:bg-surface">
                  <Link
                    to="/admin/regioes/$id/divisoes/$divId/clubes/$clubId"
                    params={{ id, divId, clubId: c.id }}
                    className="flex flex-1 items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.city ?? ""} {c.email ? `· ${c.email}` : ""}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm(`Excluir o clube "${c.name}"?`)) return;
                      const { error } = await supabase.from("clubs").delete().eq("id", c.id);
                      if (error) return alert("Erro: " + error.message);
                      qc.invalidateQueries({ queryKey: ["clubs"] });
                    }}
                    className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                    title="Excluir clube"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
