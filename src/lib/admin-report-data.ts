import { supabase } from "@/integrations/supabase/client";
import { makeReportSection, readAllReportPages, type ReportSource } from "./admin-report-model";

export async function readAdminReportSource(source: ReportSource) {
  const table = source.table;
  if (!table) throw new Error("Fonte de relatório indisponível.");
  const records = await readAllReportPages(async (offset, size) => {
    let query = supabase.from(table).select("*").order(table === "site_content" ? "key" : "id").range(offset, offset + size - 1);
    if (source.filter) query = source.filter.exclude
      ? query.neq(source.filter.column, source.filter.value)
      : query.eq(source.filter.column, source.filter.value);
    if (source.keyPrefix) query = query.like("key", `${source.keyPrefix}%`);
    if (source.id === "conexao") query = query.in("key", ["conexao-solidaria", "conexao-solidaria-menu", "aliancas-que-transformam", "nossas-categorias-de-parceria", "parceria-institucional", "parceiro-diamante", "parceiro-ouro", "parceiro-prata", "parceiro-bronze"]);
    const { data, error } = await query;
    if (error) throw new Error(`Não foi possível consultar ${source.label}.`);
    return data ?? [];
  });
  return makeReportSection(source, records);
}

export async function readAdminReportSummary(source: ReportSource) {
  const counts: { indicador: string; quantidade: number }[] = [];
  for (const [table, label] of [["clubs", "Clubes"], ["regions", "Regiões"], ["divisions", "Divisões"], ["leaders", "Líderes"], ["news", "Notícias"], ["events", "Eventos"], ["projects", "Projetos"]] as const) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    if (error) throw new Error("Não foi possível consultar o resumo do painel.");
    counts.push({ indicador: label, quantidade: count ?? 0 });
  }
  for (const state of ["ES", "RJ"]) {
    const { count, error } = await supabase.from("clubs").select("*", { count: "exact", head: true }).eq("state", state);
    if (error) throw new Error("Não foi possível consultar os clubes por estado.");
    counts.push({ indicador: `Clubes ${state}`, quantidade: count ?? 0 });
  }
  return makeReportSection(source, counts);
}