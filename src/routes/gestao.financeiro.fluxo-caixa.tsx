import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listMovimentacoes } from "@/lib/financeiro.functions";
import { formatBRL, monthLabel, lastNMonths } from "@/lib/financeiro.utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/gestao/financeiro/fluxo-caixa")({
  component: FluxoCaixaPage,
});

type Period = "6" | "12";

function FluxoCaixaPage() {
  const listMov = useServerFn(listMovimentacoes);
  const [period, setPeriod] = useState<Period>("6");

  const months = lastNMonths(parseInt(period));

  // Fetch all movs for the period
  const { data: movs, isLoading } = useQuery({
    queryKey: ["movimentacoes-fluxo", period],
    queryFn: async () => {
      const firstMonth = months[0];
      const [y, m] = firstMonth.split("-");
      // Fetch all months data - we'll aggregate client-side
      const allResults = await Promise.all(
        months.map((mes) => listMov({ data: { mes } }))
      );
      return allResults.flat();
    },
  });

  // Aggregate by month
  const byMonth: Record<string, { entrada: number; saida: number }> = {};
  for (const m of months) byMonth[m] = { entrada: 0, saida: 0 };
  for (const mov of movs ?? []) {
    const key = (mov as any).data?.substring(0, 7);
    if (!key || !byMonth[key]) continue;
    if (mov.tipo === "entrada") byMonth[key].entrada += mov.valor;
    else byMonth[key].saida += mov.valor;
  }

  const chartData = months.map((m) => ({
    mes: m,
    entrada: byMonth[m].entrada,
    saida: byMonth[m].saida,
    saldo: byMonth[m].entrada - byMonth[m].saida,
  }));

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.entrada, d.saida)), 1);
  const totalEntradas = chartData.reduce((s, d) => s + d.entrada, 0);
  const totalSaidas = chartData.reduce((s, d) => s + d.saida, 0);
  const saldoPeriodo = totalEntradas - totalSaidas;

  // Cumulative balance
  let acc = 0;
  const cumulativo = chartData.map((d) => {
    acc += d.saldo;
    return { mes: d.mes, acc };
  });

  return (
    <div>
      <GestaoHeader
        title="Fluxo de Caixa"
        subtitle="Análise de entradas, saídas e saldo acumulado"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Fluxo de Caixa" }]}
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
            {(["6", "12"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${period === p ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}
              >
                {p} meses
              </button>
            ))}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Total Entradas
            </div>
            <div className="mt-1 text-xl font-bold text-emerald-400">{formatBRL(totalEntradas)}</div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" /> Total Saídas
            </div>
            <div className="mt-1 text-xl font-bold text-red-400">{formatBRL(totalSaidas)}</div>
          </div>
          <div className={`rounded-xl border p-4 ${saldoPeriodo >= 0 ? "border-white/8 bg-white/[0.03]" : "border-red-500/20 bg-red-500/5"}`}>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Saldo do Período</div>
            <div className={`mt-1 text-xl font-bold ${saldoPeriodo >= 0 ? "text-white" : "text-red-400"}`}>{formatBRL(saldoPeriodo)}</div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6">
          <div className="mb-6 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/70" />Entradas</div>
            <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-red-500/70" />Saídas</div>
          </div>

          {isLoading ? (
            <div className="h-56 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3">
              {chartData.map((d) => (
                <div key={d.mes} className="flex items-center gap-4">
                  <div className="w-14 shrink-0 text-right text-xs font-medium text-slate-400">{monthLabel(d.mes)}</div>
                  <div className="flex flex-1 flex-col gap-1">
                    {/* Entrada bar */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 rounded-md bg-emerald-500/60 transition-all"
                        style={{ width: `${(d.entrada / maxVal) * 100}%`, minWidth: d.entrada > 0 ? "6px" : "0" }}
                      />
                      <span className="text-xs text-emerald-400">{d.entrada > 0 ? formatBRL(d.entrada) : ""}</span>
                    </div>
                    {/* Saída bar */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 rounded-md bg-red-500/60 transition-all"
                        style={{ width: `${(d.saida / maxVal) * 100}%`, minWidth: d.saida > 0 ? "6px" : "0" }}
                      />
                      <span className="text-xs text-red-400">{d.saida > 0 ? formatBRL(d.saida) : ""}</span>
                    </div>
                  </div>
                  <div className={`w-24 shrink-0 text-right text-xs font-bold ${d.saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatBRL(d.saldo)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cumulative table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          <div className="border-b border-white/8 px-5 py-4">
            <h3 className="font-display font-bold text-white">Saldo Acumulado</h3>
          </div>
          <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
            <thead className="border-b border-white/8 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Mês</th>
                <th className="px-5 py-3 text-right">Entradas</th>
                <th className="px-5 py-3 text-right">Saídas</th>
                <th className="px-5 py-3 text-right">Saldo do mês</th>
                <th className="px-5 py-3 text-right">Saldo acumulado</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d, i) => (
                <tr key={d.mes} className="border-t border-white/5">
                  <td className="px-5 py-3 font-medium text-white">{monthLabel(d.mes)}</td>
                  <td className="px-5 py-3 text-right text-emerald-400">{formatBRL(d.entrada)}</td>
                  <td className="px-5 py-3 text-right text-red-400">{formatBRL(d.saida)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${d.saldo >= 0 ? "text-white" : "text-red-400"}`}>{formatBRL(d.saldo)}</td>
                  <td className={`px-5 py-3 text-right font-bold ${cumulativo[i].acc >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatBRL(cumulativo[i].acc)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}
