import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { FileText, ExternalLink, Download, Search, X, LayoutGrid, List, Eye, Maximize2, Lock, ShieldCheck, Key } from "lucide-react";
import { useDocuments, DOCUMENT_CATEGORIES, RGD_YEARS, RGD_ITEMS, type DocumentItem, REQUIRED_ROLE_LABELS } from "@/lib/documents";
import { useAuth } from "@/hooks/use-auth";
import { logDocumentAccess } from "@/lib/documents.audit";

export const Route = createFileRoute("/documentos/")({
  component: DocumentosIndex,
});

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((c) => [c.slug, c.label]),
);

const CATEGORY_TO_PATH: Record<string, string> = {
  "atos-governador-al-2026-2027": "atos-governador/al-2026-2027",
  "atos-governador-al-2027-2028": "atos-governador/al-2027-2028",
  "estatuto-lions-internacional": "estatuto-lions-internacional",
  "estatuto-dmlc": "estatuto-dmlc",
  "estatuto-distrito-lc-11": "estatuto-distrito-lc-11",
  "estatuto-padrao-clubes": "estatuto-padrao-clubes",
  "regulamento-sede": "regulamento-sede",
  ...Object.fromEntries(
    RGD_YEARS.flatMap((y) =>
      RGD_ITEMS.map((it) => [
        `rgds-convencao-al-${y}-${it.suffix}`,
        `rgds-convencao/al-${y}/${it.suffix}`,
      ]),
    ),
  ),
};


function getDocYear(d: DocumentItem): string | null {
  const m = d.category.match(/al-(\d{4})-(\d{4})/i);
  if (m) return `${m[1]}-${m[2]}`;
  if (d.created_at) return new Date(d.created_at).getFullYear().toString();
  return null;
}

function DocumentosIndex() {
  const { data: docs = [], isLoading } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [restrictedModalDoc, setRestrictedModalDoc] = useState<DocumentItem | null>(null);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const d of docs) {
      const y = getDocYear(d);
      if (y) set.add(y);
    }
    return Array.from(set).sort().reverse();
  }, [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (year !== "all" && getDocYear(d) !== year) return false;
      if (q) {
        const hay = `${d.title} ${d.description ?? ""} ${CATEGORY_LABEL[d.category] ?? d.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [docs, query, category, year]);

  const hasFilters = query !== "" || category !== "all" || year !== "all";

  function handleAction(doc: DocumentItem, action: "VIEW" | "DOWNLOAD") {
    // If restricted and user is not logged in, prompt to log in via Member Portal /acesso
    if (doc.is_restricted && !user) {
      setRestrictedModalDoc(doc);
      return;
    }

    // Log audit event if document is restricted or if user is logged in
    if (user) {
      logDocumentAccess({
        documentId: doc.id,
        documentTitle: doc.title,
        user: { id: user.id, email: user.email ?? "sem-email" },
        action,
      });
    }

    if (action === "VIEW") {
      setPreviewDoc(doc);
    } else {
      const href = doc.file_url || doc.external_url || "#";
      window.open(href, "_blank", "noreferrer");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Transparência & Membros"
        title="Documentos do Distrito"
        description="Pesquise atos, estatutos, regulamentos e arquivos internos do Distrito LC-11."
      />

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, descrição ou categoria..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              aria-label="Buscar documentos"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filtrar por ano"
          >
            <option value="all">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setQuery(""); setCategory("all"); setYear("all"); }}
              className="inline-flex h-10 items-center gap-1 rounded-md border px-3 text-sm hover:bg-muted"
            >
              <X className="h-4 w-4" /> Limpar
            </button>
          )}
        </div>

        {/* Member Status / Portal Notice */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>
              {user ? (
                <>Conectado como <strong className="text-primary">{user.email}</strong> — Acesso a documentos restritos liberado.</>
              ) : (
                <>Documentos marcados com <strong className="text-amber-700 dark:text-amber-400">🔒 Restrito</strong> exigem autenticação no Portal de Membros.</>
              )}
            </span>
          </div>
          {!user ? (
            <Link
              to="/acesso"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 shadow-xs"
            >
              <Key className="h-3.5 w-3.5" /> Acessar Portal do Membro
            </Link>
          ) : null}
        </div>

        {/* View Mode Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b pb-3">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Carregando..." : `${filtered.length} documento(s) encontrado(s)`}
          </p>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <span className="px-2 text-xs font-medium text-muted-foreground">Visualização:</span>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Modo de Visualização em Lista"
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Modo de Visualização em Grade"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grade
            </button>
          </div>
        </div>

        {!isLoading && filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-card/50 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum documento corresponde aos filtros.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "mt-6 grid gap-4"}>
            {filtered.map((d) => {
              const isExternal = !!d.external_url && !d.file_url;
              const catPath = CATEGORY_TO_PATH[d.category];
              const catLabel = CATEGORY_LABEL[d.category] ?? d.category;

              if (viewMode === "grid") {
                return (
                  <div
                    key={d.id}
                    className={`flex flex-col justify-between rounded-xl border bg-card p-5 shadow-xs transition-all hover:shadow-md ${
                      d.is_restricted ? "border-amber-500/30 bg-amber-500/5" : ""
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {catPath ? (
                          <Link
                            to="/documentos/$"
                            params={{ _splat: catPath }}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                          >
                            {catLabel}
                          </Link>
                        ) : (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            {catLabel}
                          </span>
                        )}
                        {d.is_restricted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                            <Lock className="h-3 w-3" /> Restrito
                          </span>
                        ) : (
                          <FileText className="h-5 w-5 text-primary/70" />
                        )}
                      </div>
                      <h3 className="mt-3 font-display text-base font-semibold text-foreground line-clamp-2">
                        {d.title}
                      </h3>
                      {d.description && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                          {d.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t pt-3">
                      <button
                        type="button"
                        onClick={() => handleAction(d, "VIEW")}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                      >
                        <Eye className="h-3.5 w-3.5" /> Visualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(d, "DOWNLOAD")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        {isExternal ? <ExternalLink className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={d.id}
                  className={`flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start ${
                    d.is_restricted ? "border-amber-500/30 bg-amber-500/5" : ""
                  }`}
                >
                  {d.is_restricted ? (
                    <Lock className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <FileText className="h-6 w-6 shrink-0 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {catPath ? (
                        <Link
                          to="/documentos/$"
                          params={{ _splat: catPath }}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                        >
                          {catLabel}
                        </Link>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{catLabel}</span>
                      )}
                      {d.is_restricted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          🔒 Restrito ({REQUIRED_ROLE_LABELS[d.required_role || "membro"]})
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{d.title}</h3>
                    {d.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{d.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => handleAction(d, "VIEW")}
                      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-surface"
                    >
                      <Eye className="h-4 w-4" /> Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(d, "DOWNLOAD")}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      {isExternal ? (<>Abrir <ExternalLink className="h-4 w-4" /></>) : (<>Baixar <Download className="h-4 w-4" /></>)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Restricted Document Access Prompt Modal */}
      {restrictedModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Documento Restrito</span>
              <h2 className="font-display text-xl font-bold text-foreground mt-0.5">{restrictedModalDoc.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Este arquivo é de circulação interna e exige autenticação no <strong>Portal de Membros</strong> do Distrito LC-11.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRestrictedModalDoc(null);
                  navigate({ to: "/acesso", search: { returnTo: "/documentos" } });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 shadow"
              >
                <Key className="h-4 w-4" /> Entrar no Portal do Membro
              </button>
              <button
                type="button"
                onClick={() => setRestrictedModalDoc(null)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex h-[90vh] w-[95vw] max-w-5xl flex-col rounded-xl bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-display font-semibold truncate">{previewDoc.title}</span>
                {previewDoc.is_restricted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    <Lock className="h-3 w-3" /> Restrito
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(previewDoc, "DOWNLOAD")}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-muted/20 p-2 overflow-hidden">
              {previewDoc.file_url && /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(previewDoc.file_url) ? (
                <div className="flex h-full items-center justify-center p-4">
                  <img src={previewDoc.file_url} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
                </div>
              ) : (
                <iframe
                  src={previewDoc.file_url || previewDoc.external_url || "about:blank"}
                  title="Visualizador de documento"
                  className="h-full w-full rounded border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


