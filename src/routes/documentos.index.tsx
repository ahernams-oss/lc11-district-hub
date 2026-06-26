import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { FileText, ExternalLink, Download, Search, X } from "lucide-react";
import { useDocuments, DOCUMENT_CATEGORIES, type DocumentItem } from "@/lib/documents";

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
};

function getDocYear(d: DocumentItem): string | null {
  const m = d.category.match(/al-(\d{4})-(\d{4})/i);
  if (m) return `${m[1]}-${m[2]}`;
  if (d.created_at) return new Date(d.created_at).getFullYear().toString();
  return null;
}

function DocumentosIndex() {
  const { data: docs = [], isLoading } = useDocuments();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>("all");

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

  return (
    <>
      <PageHero
        eyebrow="Transparência"
        title="Documentos"
        description="Pesquise atos, estatutos e regulamentos do Distrito LC-11."
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

        <p className="mt-4 text-sm text-muted-foreground">
          {isLoading ? "Carregando..." : `${filtered.length} documento(s) encontrado(s)`}
        </p>

        {!isLoading && filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-card/50 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhum documento corresponde aos filtros.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4">
            {filtered.map((d) => {
              const href = d.file_url || d.external_url || "#";
              const isExternal = !!d.external_url && !d.file_url;
              const catPath = CATEGORY_TO_PATH[d.category];
              const catLabel = CATEGORY_LABEL[d.category] ?? d.category;
              return (
                <li
                  key={d.id}
                  className="flex flex-col gap-3 rounded-md border bg-card p-4 sm:flex-row sm:items-start"
                >
                  <FileText className="h-6 w-6 shrink-0 text-primary" />
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
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{d.title}</h3>
                    {d.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{d.description}</p>
                    )}
                  </div>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    {isExternal ? (<>Abrir <ExternalLink className="h-4 w-4" /></>) : (<>Baixar <Download className="h-4 w-4" /></>)}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
