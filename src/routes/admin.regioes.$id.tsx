import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDivisions } from "@/lib/regions";
import { ArrowLeft, Plus, Trash2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin/regioes/$id")({
  component: RegionEditor,
});

interface Form {
  letter: string;
  name: string;
  description: string;
  order_index: number;
}
const EMPTY: Form = { letter: "", name: "", description: "", order_index: 0 };

function RegionEditor() {
  const { id } = useParams({ from: "/admin/regioes/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: divisions = [] } = useDivisions(isNew ? undefined : id);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("regions")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setForm({
            letter: data.letter,
            name: data.name,
            description: data.description ?? "",
            order_index: data.order_index ?? 0,
          });
        setLoading(false);
      });
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      if (isNew) {
        const { data, error } = await supabase.from("regions").insert(form).select().single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["regions"] });
        navigate({ to: "/admin/regioes/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("regions").update(form).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["regions"] });
        setMsg("Salvo!");
      }
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir esta região? Todas as divisões e clubes vinculados também serão excluídos."))
      return;
    const { error } = await supabase.from("regions").delete().eq("id", id);
    if (error) return alert("Erro: " + error.message);
    qc.invalidateQueries({ queryKey: ["regions"] });
    navigate({ to: "/admin/regioes" });
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/regioes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Regiões
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Nova região" : `Região ${form.letter}`}
      </h1>

      <div className="mt-6 space-y-4 rounded-md border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
          <Field label="Letra *">
            <input
              maxLength={3}
              value={form.letter}
              onChange={(e) => setForm({ ...form, letter: e.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
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
            disabled={saving || !form.letter || !form.name}
            className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="inline h-4 w-4" /> Excluir região
            </button>
          )}
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </div>

      {!isNew && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Divisões desta região</h2>
            <Link
              to="/admin/regioes/$id/divisoes/$divId"
              params={{ id, divId: "novo" }}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Nova divisão
            </Link>
          </div>
          {divisions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma divisão cadastrada.</p>
          ) : (
            <ul className="mt-3 divide-y rounded-md border bg-card">
              {divisions.map((d) => (
                <li key={d.id}>
                  <Link
                    to="/admin/regioes/$id/divisoes/$divId"
                    params={{ id, divId: d.id }}
                    className="flex items-center gap-3 p-3 hover:bg-surface"
                  >
                    <div className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {d.code}
                    </div>
                    <div className="flex-1 font-semibold">{d.name}</div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
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
