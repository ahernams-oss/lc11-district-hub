import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, FileText, Plus, Trash2 } from "lucide-react";
import {
  CONTENT_LABELS,
  DEFAULT_CONEXAO_SUBMENU,
  fetchSiteContent,
  saveSiteContent,
  type ConexaoMenuItem,
} from "@/lib/content";

export const Route = createFileRoute("/admin/conexao-solidaria")({
  component: AdminConexaoSolidaria,
});

const PAGES = [
  "conexao-solidaria",
  "aliancas-que-transformam",
  "nossas-categorias-de-parceria",
  "parceria-institucional",
  "parceiro-diamante",
  "parceiro-ouro",
  "parceiro-prata",
  "parceiro-bronze",
] as const;

function AdminConexaoSolidaria() {
  const [items, setItems] = useState<ConexaoMenuItem[]>(DEFAULT_CONEXAO_SUBMENU.items);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteContent("conexao-solidaria-menu")
      .then((d) => {
        if (Array.isArray(d.items) && d.items.length > 0) setItems(d.items as ConexaoMenuItem[]);
      })
      .finally(() => setLoading(false));
  }, []);

  function update(index: number, patch: Partial<ConexaoMenuItem>) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      const j = index + dir;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const clean = items
        .map((it) => ({ label: it.label.trim(), to: it.to.trim() }))
        .filter((it) => it.label && it.to);
      await saveSiteContent("conexao-solidaria-menu", { items: clean });
      setItems(clean);
      setMsg("Salvo com sucesso!");
    } catch (e: any) {
      setMsg("Erro: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Conexão Solidária</h1>
      <p className="mt-2 text-muted-foreground">
        Edite as páginas do programa e gerencie os submenus exibidos no menu do site.
      </p>

      <h2 className="mt-8 font-semibold text-foreground">Páginas</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {PAGES.map((k) => (
          <Link
            key={k}
            to="/admin/conteudo/$key"
            params={{ key: k }}
            className="rounded-xl border bg-card p-5 shadow-card transition-transform hover:-translate-y-1"
          >
            <FileText className="h-6 w-6 text-primary" />
            <div className="mt-2 font-semibold text-foreground">{CONTENT_LABELS[k]}</div>
            <div className="text-xs text-muted-foreground">Editar textos e imagem</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 font-semibold text-foreground">Submenus do menu "Conexão Solidária"</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cada item aparece no submenu do site. Use links internos (ex.: /aliancas-que-transformam) ou externos completos (https://...).
      </p>

      {loading ? (
        <p className="mt-6 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((it, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-center">
              <input
                type="text"
                value={it.label}
                placeholder="Nome do submenu"
                onChange={(e) => update(i, { label: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm sm:w-64"
              />
              <input
                type="text"
                value={it.to}
                placeholder="/caminho-da-pagina"
                onChange={(e) => update(i, { to: e.target.value })}
                className="w-full flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="rounded-md border p-2 hover:bg-surface"
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="rounded-md border p-2 hover:bg-surface"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setItems((list) => list.filter((_, j) => j !== i))}
                  className="rounded-md border p-2 text-destructive hover:bg-surface"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setItems((list) => [...list, { label: "", to: "" }])}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface"
          >
            <Plus className="h-4 w-4" /> Adicionar submenu
          </button>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar submenus"}
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
