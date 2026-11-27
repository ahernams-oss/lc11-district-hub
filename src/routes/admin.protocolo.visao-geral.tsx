import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BreakHint } from "@/components/BreakHint";
import {
  DEFAULT_PROTOCOL_OVERVIEW,
  fetchProtocolOverview,
  saveProtocolOverview,
  type ProtocolOverviewContent,
} from "@/lib/protocol-content";

export const Route = createFileRoute("/admin/protocolo/visao-geral")({
  head: () => ({ meta: [
    { title: "Protocolo Leonístico — Visão geral — Painel Admin LC-11" },
    { name: "description", content: "Edição dos textos da página de visão geral de Protocolo Leonístico." },
    { property: "og:title", content: "Protocolo Leonístico — Visão geral — Painel Admin LC-11" },
    { property: "og:description", content: "Edição dos textos da página de visão geral de Protocolo Leonístico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: ProtocolOverviewEditor,
});

function ProtocolOverviewEditor() {
  const [values, setValues] = useState<ProtocolOverviewContent>(DEFAULT_PROTOCOL_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchProtocolOverview().then((content) => {
      setValues(content);
      setLoading(false);
    });
  }, []);

  function patch(next: Partial<ProtocolOverviewContent>) {
    setValues((current) => ({ ...current, ...next }));
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await saveProtocolOverview(values);
      setMsg("Salvo com sucesso!");
    } catch (error) {
      setMsg("Erro: " + (error instanceof Error ? error.message : "não foi possível salvar"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/protocolo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Temas de Protocolo
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">Protocolo Leonístico — Visão geral</h1>
      <p className="mt-1 text-xs text-muted-foreground">/protocolo-leonistico</p>

      {loading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground">Sobre-título</label>
            <input
              type="text"
              value={values.eyebrow}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Título</label>
            <textarea
              rows={2}
              value={values.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Introdução (opcional)</label>
            <textarea
              rows={6}
              value={values.intro}
              onChange={(e) => patch({ intro: e.target.value })}
              placeholder="Texto exibido acima da ordem de precedência."
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-sans"
            />
            <BreakHint />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <Link
              to="/protocolo-leonistico"
              className="rounded-md border px-4 py-2 text-sm hover:bg-surface"
            >
              Ver no site
            </Link>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
