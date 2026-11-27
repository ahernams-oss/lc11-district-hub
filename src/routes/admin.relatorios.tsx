import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileSpreadsheet, FileText, Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { listAuthUsers } from "@/lib/admin-users.functions";
import { ADMIN_REPORT_SOURCES, makeReportSection, type AdminReportSection } from "@/lib/admin-report-model";
import { readAdminReportSource, readAdminReportSummary } from "@/lib/admin-report-data";
import { buildAdminExcel, buildAdminPdf, deliverAdminReport } from "@/lib/admin-report-export";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios Excel e PDF — Administração LC-11" },
    { name: "description", content: "Exportação dos registros de todas as áreas do painel administrativo do Distrito LC-11." },
    { property: "og:title", content: "Relatórios Excel e PDF — Administração LC-11" },
    { property: "og:description", content: "Relatórios administrativos de conteúdo, clubes, eventos, doações e acessos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminReports,
});

function AdminReports() {
  const { user, hasPanelAccess, canViewUsers, isAdmin, loading, devBypass } = useAuth();
  const listUsers = useServerFn(listAuthUsers);
  const [selected, setSelected] = useState<string[]>(["clubes"]);
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState<AdminReportSection[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ excel?: Blob; pdf?: Blob }>({});
  const sources = ADMIN_REPORT_SOURCES.filter((source) => source.access === "admin" ? isAdmin : source.access === "users" ? canViewUsers : hasPanelAccess);
  const invalidate = () => { setSections(null); setFiles({}); setError(""); };
  if (loading) return <p role="status">Carregando…</p>;
  if (!hasPanelAccess || !user) return <p role="alert">Acesso restrito ao painel administrativo.</p>;

  async function consult() {
    if (busy || devBypass) return;
    setBusy("consultar"); setError(""); setSections(null); setFiles({});
    try {
      const result: AdminReportSection[] = [];
      for (const source of sources.filter((item) => selected.includes(item.id))) {
        const section = source.id === "usuarios" ? makeReportSection(source, await listUsers({}))
          : source.id === "inicio" ? await readAdminReportSummary(source) : await readAdminReportSource(source);
        const term = search.trim().toLocaleLowerCase("pt-BR");
        result.push({ ...section, rows: section.rows.filter((row) => !term || Object.values(row).some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term))) });
      }
      setSections(result);
      setBusy("excel");
      const context = search.trim() ? `Busca: ${search.trim()}` : "Todos os registros das áreas selecionadas";
      try {
        const excel = await buildAdminExcel(result, context);
        setFiles({ excel });
      } catch (err) {
        setError(err instanceof Error ? `Não foi possível preparar o Excel: ${err.message}` : "Não foi possível preparar o Excel. Clique em Gerar Excel para tentar novamente.");
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível consultar os registros."); }
    finally { setBusy(null); }
  }

  async function generate(format: "excel" | "pdf") {
    if (!sections || busy) return;
    setBusy(format); setError("");
    try {
      const context = search.trim() ? `Busca: ${search.trim()}` : "Todos os registros das áreas selecionadas";
      const blob = await (format === "excel" ? buildAdminExcel(sections, context) : buildAdminPdf(sections, context));
      setFiles((current) => ({ ...current, [format]: blob }));
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível gerar o arquivo. Tente novamente."); }
    finally { setBusy(null); }
  }

  const total = sections?.reduce((sum, section) => sum + section.rows.length, 0) ?? 0;
  const download = async (blob: Blob, extension: string) => {
    try { await deliverAdminReport(blob, `relatorios-admin-lc11-${new Date().toISOString().slice(0, 10)}.${extension}`); }
    catch { setError("Não foi possível baixar o arquivo. Tente novamente."); }
  };

  return <div className="space-y-6">
    <header className="border-b border-border pb-5"><h1 className="font-display text-2xl font-bold">Relatórios</h1><p className="mt-1 text-sm text-muted-foreground">Painel administrativo · Distrito LC-11</p></header>
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-lg font-semibold">Áreas do painel</h2><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!!busy} onClick={() => { setSelected(sources.map((source) => source.id)); invalidate(); }}>Selecionar todas</Button><Button variant="ghost" size="sm" disabled={!!busy} onClick={() => { setSelected([]); invalidate(); }}>Limpar</Button></div></div>
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {sources.map((source) => <label key={source.id} className="flex min-w-0 cursor-pointer items-start gap-3 text-sm"><Checkbox aria-label={source.label} checked={selected.includes(source.id)} disabled={!!busy} onCheckedChange={(checked) => { setSelected((current) => checked ? [...current, source.id] : current.filter((id) => id !== source.id)); invalidate(); }} /><span className="min-w-0 break-words">{source.label}</span></label>)}
    </div>
    <div className="flex flex-wrap gap-3 border-y border-border py-5"><div className="relative min-w-0 flex-1 basis-64"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar nos registros" placeholder="Nome, título, ano, cidade ou outro campo" className="pl-9" value={search} disabled={!!busy} onChange={(event) => { setSearch(event.target.value); invalidate(); }} /></div><Button disabled={!!busy || !selected.some((id) => sources.some((source) => source.id === id)) || devBypass} onClick={() => void consult()}>{busy === "consultar" ? <Loader2 className="animate-spin" /> : <Search />}Consultar</Button></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {busy && <p role="status" className="text-sm text-muted-foreground">{busy === "consultar" ? "Consultando registros…" : "Preparando arquivo…"}</p>}
    {sections && <>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-lg font-semibold">Resultado</h2><p className="text-sm text-muted-foreground">{total.toLocaleString("pt-BR")} registros · {sections.length} áreas</p></div><div className="flex flex-wrap gap-2">
        {files.excel ? <Button variant="outline" disabled={!!busy} onClick={() => { if (files.excel) void download(files.excel, "xlsx"); }}><Download />Baixar Excel</Button> : <Button variant="outline" disabled={!!busy} onClick={() => void generate("excel")}><FileSpreadsheet />Gerar Excel</Button>}
        {files.pdf ? <Button variant="outline" disabled={!!busy} onClick={() => { if (files.pdf) void download(files.pdf, "pdf"); }}><Download />Baixar PDF</Button> : <Button variant="outline" disabled={!!busy} onClick={() => void generate("pdf")}><FileText />Gerar PDF</Button>}
      </div></div>
      <table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="py-3 font-medium">Área</th><th className="py-3 text-right font-medium">Registros</th></tr></thead><tbody>{sections.map((section) => <tr key={section.id} className="border-b border-border"><td className="py-3">{section.label}</td><td className="py-3 text-right tabular-nums">{section.rows.length.toLocaleString("pt-BR")}</td></tr>)}</tbody></table>
    </>}
  </div>;
}