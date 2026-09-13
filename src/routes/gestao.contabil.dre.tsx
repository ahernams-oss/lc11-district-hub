import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { ExportButtons } from "@/components/gestao/ExportButtons";
import { getDreContabil } from "@/lib/contabil.functions";
import { formatBRL } from "@/lib/financeiro.utils";
import type { ReportRow } from "@/lib/report-export";
import { TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/gestao/contabil/dre")({
  component: DreContabilPage,
});

const MESES = Array.from({ length: 12 }, (_, i) => i + 1);

function mesNome(m: number) {
  return new Date(2000, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
}

function DreContabilPage() {
  const fetchDre = useServerFn(getDreContabil);
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mesInicio, setMesInicio] = useState(1);
  const [mesFim, setMesFim] = useState(now.getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ["dre-contabil", ano, mesInicio, mesFim],
    queryFn: () => fetchDre({ data: { ano, mesInicio, mesFim } }),
  });

  const periodoLabel = `${mesNome(mesInicio)} a ${mesNome(mesFim)} de ${ano}`;

  function buildSpec() {
    const rows: ReportRow[] = [];
    rows.push({ conta: "RECEITAS", valor: formatBRL(data?.totalReceitas ?? 0), __bold: true });
    for (const l of data?.receitas ?? []) {
      rows.push({ conta: `${l.codigo} — ${l.nome}`, valor: formatBRL(l.valor), __indent: 1 });
    }
    rows.push({ conta: "DESPESAS", valor: formatBRL(data?.totalDespesas ?? 0), __bold: true });
    for (const l of data?.despesas ?? []) {
      rows.push({ conta: `${l.codigo} — ${l.nome}`, valor: formatBRL(l.valor), __indent: 1 });
    }
    return {
      filename: `dre-contabil-${ano}-${String(mesInicio).padStart(2, "0")}-${String(mesFim).padStart(2, "0")}`,
      title: "DRE Contábil — Demonstração do Resultado",
      subtitle: `Período: ${periodoLabel}`,
      columns: [
        { key: "conta", label: "Conta contábil", weight: 4 },
        { key: "valor", label: "Valor", align: "right" as const, weight: 1 },
      ],
      rows,
      footerRows: [
        { conta: "RESULTADO DO PERÍODO", valor: formatBRL(data?.resultado ?? 0) },
      ],
    };
  }

  const resultado = data?.resultado ?? 0;

  return (
    <div>
      <GestaoHeader
        title="DRE Contábil"
        subtitle="Demonstração do Resultado do Exercício com base nos lançamentos contábeis validados"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Contábil", to: "/gestao/contabil" }, { label: "DRE" }]}
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Período:</label>
            <select value={mesInicio} onChange={(e) => setMesInicio(parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
              {MESES.map((m) => <option key={m} value={m}>{mesNome(m)}</option>)}
            </select>
            <span className="text-xs text-slate-500">até</span>
            <select value={mesFim} onChange={(e) => setMesFim(parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
              {MESES.map((m) => <option key={m} value={m}>{mesNome(m)}</option>)}
            </select>
            <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ExportButtons getSpec={buildSpec} disabled={isLoading || !data} />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-white/8 bg-white/[0.03] py-16 text-center text-sm text-slate-500">
            Calculando resultado...
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.04] px-6 py-4">
              <h3 className="font-display text-lg font-bold text-white">DRE — {periodoLabel}</h3>
              <div className={`text-sm font-bold ${resultado >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                Resultado: {formatBRL(resultado)}
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {([
                { label: "Receitas", items: data?.receitas ?? [], total: data?.totalReceitas ?? 0, color: "emerald", Icon: TrendingUp },
                { label: "Despesas", items: data?.despesas ?? [], total: data?.totalDespesas ?? 0, color: "red", Icon: TrendingDown },
              ]).map(({ label, items, total, color, Icon }) => (
                <div key={label} className="px-6 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className={`flex items-center gap-2 font-semibold ${color === "emerald" ? "text-emerald-400" : "text-red-400"}`}>
                      <Icon className="h-4 w-4" /> {label}
                    </div>
                    <div className={`font-bold ${color === "emerald" ? "text-emerald-400" : "text-red-400"}`}>{formatBRL(total)}</div>
                  </div>
                  {items.length === 0 ? (
                    <div className="pl-6 text-xs text-slate-600">Nenhum lançamento no período</div>
                  ) : (
                    <div className="space-y-1.5 pl-6">
                      {items.map((l) => (
                        <div key={l.id} className="flex justify-between text-sm">
                          <span className="text-slate-400"><span className="font-mono text-xs text-slate-500">{l.codigo}</span> {l.nome}</span>
                          <span className="font-mono text-slate-200">{formatBRL(l.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-white/[0.02] px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold text-white">Resultado do Período</span>
                  <span className={`font-display text-2xl font-bold ${resultado >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatBRL(resultado)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
