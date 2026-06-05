import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, uploadLeaderPhoto, type LeaderCategory } from "@/lib/leaders";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/lideres/$id")({
  component: LeaderEditor,
});

const CATEGORIES: LeaderCategory[] = [
  "governador",
  "vice1",
  "vice2",
  "gat",
  "assessoria",
  "ex_governador",
];

interface FormState {
  category: LeaderCategory;
  name: string;
  role: string;
  bio: string;
  message: string;
  photo_url: string;
  pin_url: string;
  email: string;
  phone: string;
  year_label: string;
  motto: string;
  order_index: number;
}

const EMPTY: FormState = {
  category: "governador",
  name: "",
  role: "",
  bio: "",
  message: "",
  photo_url: "",
  pin_url: "",
  email: "",
  phone: "",
  year_label: "",
  motto: "",
  order_index: 0,
};

function LeaderEditor() {
  const { id } = useParams({ from: "/admin/lideres/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category") as LeaderCategory | null;
      if (cat && CATEGORIES.includes(cat)) {
        setForm((f) => ({ ...f, category: cat }));
      }
      return;
    }
    supabase
      .from("leaders")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            category: data.category as LeaderCategory,
            name: data.name ?? "",
            role: data.role ?? "",
            bio: data.bio ?? "",
            message: data.message ?? "",
            photo_url: data.photo_url ?? "",
            pin_url: (data as any).pin_url ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            year_label: data.year_label ?? "",
            motto: data.motto ?? "",
            order_index: data.order_index ?? 0,
          });
        }
        setLoading(false);
      });
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    const payload = { ...form };
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("leaders")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["leaders"] });
        navigate({ to: "/admin/lideres/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("leaders").update(payload).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["leaders"] });
        setMsg("Salvo com sucesso!");
      }
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto(file: File) {
    setSaving(true);
    try {
      const url = await uploadLeaderPhoto(file);
      setForm((f) => ({ ...f, photo_url: url }));
      setMsg("Foto enviada. Clique em Salvar.");
    } catch (e: any) {
      setMsg("Erro no upload: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePin(file: File) {
    setSaving(true);
    try {
      const url = await uploadLeaderPhoto(file);
      setForm((f) => ({ ...f, pin_url: url }));
      setMsg("PIN enviado. Clique em Salvar.");
    } catch (e: any) {
      setMsg("Erro no upload: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/lideres" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Novo líder" : "Editar líder"}
      </h1>

      <div className="mt-6 space-y-4">
        <Field label="Categoria">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as LeaderCategory })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Foto">
          {form.photo_url && (
            <img src={form.photo_url} alt="" className="mb-2 h-32 w-32 rounded-md object-cover" />
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
            <Upload className="h-4 w-4" /> Enviar foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            />
          </label>
          {form.photo_url && (
            <button
              onClick={() => setForm({ ...form, photo_url: "" })}
              className="ml-2 text-xs text-destructive hover:underline"
            >
              Remover
            </button>
          )}
        </Field>

        <Field label="Nome completo *">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>

        <Field label="Cargo / título (ex.: Governador do Distrito LC-11)">
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>

        {form.category === "ex_governador" && (
          <>
            <Field label="Ano de gestão (ex.: 2023–2024)">
              <input
                type="text"
                value={form.year_label}
                onChange={(e) => setForm({ ...form, year_label: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </Field>
            <Field label="Lema">
              <input
                type="text"
                value={form.motto}
                onChange={(e) => setForm({ ...form, motto: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </Field>
          </>
        )}

        {(form.category === "governador" ||
          form.category === "vice1" ||
          form.category === "vice2") && (
          <Field label="Mensagem (citação destaque)">
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
        )}

        <Field label="Biografia / trajetória">
          <textarea
            rows={6}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
          <Field label="Telefone">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
        </div>

        <Field label="Ordem (menor aparece primeiro)">
          <input
            type="number"
            value={form.order_index}
            onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })}
            className="mt-1 w-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>

        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={handleSave}
            disabled={saving || !form.name}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
