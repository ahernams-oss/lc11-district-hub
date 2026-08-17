import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { getBalancete } from "@/lib/contabil.functions";
import { formatBRL, monthLabel } from "@/lib/financeiro.utils";
import { FileSpreadsheet, Download, Folder, FileText } from "lucide-react";

export const Route = createFileRoute("/gestao/contabil/balancete")({
  component: BalancetePage,
});

function BalancetePage() {
  const fetchBalancete = useServerFn(getBalancete);

  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ["balancete", ano, mes],
    queryFn: () => fetchBalancete({ data: { ano, mes } }),
  });

  return (
    <div>
      <GestaoHeader
        title="Balancete de Verificação"
        subtitle="Demonstração periódica dos saldos de débitos e créditos de todas as contas contábeis"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Contábil", to: "/gestao/contabil" }, { label: "Balancete" }]}
      />

      <div className="p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Período:</label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(ano, m - 1, 1).toLocaleDateString("pt-BR", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Balancete de Verificação referentes a <span className="font-semibold text-white">{monthLabel(`${ano}-${String(mes).padStart(2, "0")}`)}</span>
          </div>
        </div>

        {/* Balancete Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Calculando balancete contábil...</div>
          ) : (data?.balancete?.length ?? 0) === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">Nenhum dado encontrado para o período selecionado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-36">Código</th>
                  <th className="px-4 py-3">Conta Contábil</th>
                  <th className="px-4 py-3 text-right">Saldo Anterior</th>
                  <th className="px-4 py-3 text-right text-emerald-400">Débito (Mês)</th>
                  <th className="px-4 py-3 text-right text-red-400">Crédito (Mês)</th>
                  <th className="px-4 py-3 text-right font-bold">Saldo Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data?.balancete ?? []).map((row) => {
                  const indent = (row.nivel - 1) * 18;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        row.sintetica ? "font-bold text-white bg-white/[0.01]" : "text-slate-300"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs">{row.codigo}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
                          {row.sintetica ? (
                            <Folder className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          )}
                          <span>{row.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{formatBRL(row.saldoAnterior)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-400">{row.debito > 0 ? formatBRL(row.debito) : "—"}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-red-400">{row.credito > 0 ? formatBRL(row.credito) : "—"}</td>
                      <td className={`px-4 py-2.5 text-right font-mono ${row.saldoAtual >= 0 ? "text-white" : "text-red-400"}`}>
                        {formatBRL(row.saldoAtual)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-white/10 bg-white/[0.03] font-bold text-white">
                <tr>
                  <td colSpan={3} className="px-4 py-4 uppercase text-xs tracking-wider">Total Geral do Período</td>
                  <td className="px-4 py-4 text-right font-mono text-emerald-400">{formatBRL(data?.totalDebito ?? 0)}</td>
                  <td className="px-4 py-4 text-right font-mono text-red-400">{formatBRL(data?.totalCredito ?? 0)}</td>
                  <td className="px-4 py-4 text-right font-mono">
                    {(data?.totalDebito ?? 0) === (data?.totalCredito ?? 0) ? (
                      <span className="text-emerald-400">Equilibrado ✓</span>
                    ) : (
                      <span className="text-red-400">Desequilibrado!</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
