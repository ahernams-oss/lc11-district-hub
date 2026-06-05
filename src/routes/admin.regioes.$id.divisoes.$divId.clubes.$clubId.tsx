import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDivision, useRegion } from "@/lib/regions";
import { uploadContentImage } from "@/lib/leaders";
import { ArrowLeft, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/regioes/$id/divisoes/$divId/clubes/$clubId")({
  component: ClubEditor,
});

interface Form {
  name: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  meetings: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  president: string;
  logo_url: string;
  order_index: number;
}
const EMPTY: Form = {
  name: "",
  city: "",
  state: "",
  email: "",
  phone: "",
  meetings: "",
  address: "",
  website: "",
  instagram: "",
  facebook: "",
  president: "",
  logo_url: "",
  order_index: 0,
};


function ClubEditor() {
  const { id, divId, clubId } = useParams({
    from: "/admin/regioes/$id/divisoes/$divId/clubes/$clubId",
  });
  const isNew = clubId === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: region } = useRegion(id);
  const { data: division } = useDivision(divId);

  useEffect(() => {
    if (isNew) return;
    supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            name: data.name ?? "",
            city: data.city ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            meetings: data.meetings ?? "",
            address: data.address ?? "",
            website: data.website ?? "",
            instagram: data.instagram ?? "",
            facebook: data.facebook ?? "",
            president: data.president ?? "",
            logo_url: data.logo_url ?? "",
            order_index: data.order_index ?? 0,
          });
        }
        setLoading(false);
      });
  }, [clubId, isNew]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("clubs")
          .insert({ ...form, division_id: divId })
          .select()
          .single();
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["clubs"] });
        navigate({
          to: "/admin/regioes/$id/divisoes/$divId/clubes/$clubId",
          params: { id, divId, clubId: data.id },
        });
      } else {
        const { error } = await supabase.from("clubs").update(form).eq("id", clubId);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["clubs"] });
        setMsg("Salvo!");
      }
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este clube?")) return;
    const { error } = await supabase.from("clubs").delete().eq("id", clubId);
    if (error) return alert("Erro: " + error.message);
    qc.invalidateQueries({ queryKey: ["clubs"] });
    navigate({ to: "/admin/regioes/$id/divisoes/$divId", params: { id, divId } });
  }

  async function handleLogo(file: File) {
    setSaving(true);
    try {
      const url = await uploadContentImage(file, "clubs");
      setForm((f) => ({ ...f, logo_url: url }));
      setMsg("Imagem enviada. Clique em Salvar.");
    } catch (e: any) {
      setMsg("Erro no upload: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-4xl">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/regioes" className="hover:text-primary">
          Regiões
        </Link>
        <span>/</span>
        <Link to="/admin/regioes/$id" params={{ id }} className="hover:text-primary">
          {region?.name ?? "Região"}
        </Link>
        <span>/</span>
        <Link
          to="/admin/regioes/$id/divisoes/$divId"
          params={{ id, divId }}
          className="hover:text-primary"
        >
          {division?.code ?? "Divisão"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{isNew ? "Novo clube" : form.name}</span>
      </nav>
      <Link
        to="/admin/regioes/$id/divisoes/$divId"
        params={{ id, divId }}
        className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar à divisão
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {isNew ? "Novo clube" : form.name}
      </h1>

      <div className="mt-6 space-y-4 rounded-md border bg-card p-5">
        <Field label="Logo / foto">
          {form.logo_url && (
            <img src={form.logo_url} alt="" className="mb-2 h-24 w-24 rounded-md object-cover" />
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface">
            <Upload className="h-4 w-4" /> Enviar imagem
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])}
            />
          </label>
          {form.logo_url && (
            <button
              onClick={() => setForm({ ...form, logo_url: "" })}
              className="ml-2 text-xs text-destructive hover:underline"
            >
              Remover
            </button>
          )}
        </Field>

        <Field label="Nome do clube *">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cidade">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
          <Field label="Presidente atual">
            <input
              value={form.president}
              onChange={(e) => setForm({ ...form, president: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
          <Field label="Telefone">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
          <Field label="Reuniões (dia/horário)">
            <input
              value={form.meetings}
              onChange={(e) => setForm({ ...form, meetings: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              placeholder="Ex.: 2ª e 4ª terça, 20h"
            />
          </Field>
          <Field label="Site">
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              placeholder="https://"
            />
          </Field>
          <Field label="Instagram">
            <input
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
              placeholder="@usuario ou URL"
            />
          </Field>
          <Field label="Facebook">
            <input
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </Field>
        </div>

        <Field label="Endereço">
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
            disabled={saving || !form.name}
            className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="rounded-md border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="inline h-4 w-4" /> Excluir clube
            </button>
          )}
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
