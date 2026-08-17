import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listMovimentacoes, listCategorias } from "@/lib/financeiro.functions";
import { formatBRL, monthLabel, lastNMonths, currentYearMonth } from "@/lib/financeiro.utils";
import { FileText, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/gestao/financeiro/relatorios")({
  component: RelatoriosPage,
});

type Report = "dre" | "categorias" | "mensal";

function RelatoriosPage() {
  const listMov = useServerFn(listMovimentacoes);
  const listCats = useServerFn(listCategorias);
  const [activeReport, setActiveReport] = useState<Report>("dre");
  const [mes, setMes] = useState(currentYearMonth());
  const [period, setPeriod] = useState("12");

  const months = lastNMonths(parseInt(period));

  // Fetch movimentações for selected month (DRE)
  const { data: movsMes, isLoading: loadingMes } = useQuery({
    queryKey: ["movs-relatorio-mes", mes],
    queryFn: () => listMov({ data: { mes } }),
  });

  // Fetch all movimentos for period (categorias report)
  const { data: movsTodos, isLoading: loadingTodos } = useQuery({
    queryKey: ["movs-relatorio-todos", period],
    queryFn: async () => {
      const all = await Promise.all(months.map((m) => listMov({ data: { mes: m } })));
      return all.flat();
    },
    enabled: activeReport === "categorias",
  });

  const { data: categorias } = useQuery({ queryKey: ["fin-categorias"], queryFn: () => listCats({}) });

  // DRE calculations
  const dreReceitas = (movsMes ?? []).filter((m) => m.tipo === "entrada");
  const dreDespesas = (movsMes ?? []).filter((m) => m.tipo === "saida");
  const totalReceitas = dreReceitas.reduce((s, m) => s + m.valor, 0);
  const totalDespesas = dreDespesas.reduce((s, m) => s + m.valor, 0);
  const resultadoLiquido = totalReceitas - totalDespesas;

  // Category aggregation
  const catTotais: Record<string, { nome: string; cor: string; tipo: string; total: number }> = {};
  for (const mov of movsTodos ?? []) {
    const cat = (mov as any).categoria;
    const catId = (mov as any).categoria_id ?? "sem-categoria";
    if (!catTotais[catId]) {
      catTotais[catId] = { nome: cat?.nome ?? "Sem categoria", cor: cat?.cor ?? "#6b7280", tipo: mov.tipo === "entrada" ? "receita" : "despesa", total: 0 };
    }
    catTotais[catId].total += mov.valor;
  }
  const catReceitas = Object.entries(catTotais).filter(([, v]) => v.tipo === "receita").sort((a, b) => b[1].total - a[1].total);
  const catDespesas = Object.entries(catTotais).filter(([, v]) => v.tipo === "despesa").sort((a, b) => b[1].total - a[1].total);
  const maxCatVal = Math.max(...Object.values(catTotais).map((v) => v.total), 1);

  // Monthly report
  const byMonth: Record<string, { entrada: number; saida: number }> = {};
  for (const m of months) byMonth[m] = { entrada: 0, saida: 0 };
  for (const mov of movsMes ?? []) {
    const key = (mov as any).data?.substring(0, 7);
    if (key && byMonth[key]) {
      if (mov.tipo === "entrada") byMonth[key].entrada += mov.valor;
      else byMonth[key].saida += mov.valor;
    }
  }

  return (
    <div>
      <GestaoHeader
        title="Relatórios Financeiros"
        subtitle="DRE, análise por categorias e evolução mensal"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Relatórios" }]}
      />

      <div className="p-6 space-y-6">
        {/* Report selector */}
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] p-1.5 w-fit">
          {([
            { key: "dre", label: "DRE", icon: FileText },
            { key: "categorias", label: "Por Categoria", icon: BarChart3 },
          ] as { key: Report; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveReport(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeReport === key
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* DRE Report */}
        {activeReport === "dre" && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
              <span className="text-sm text-slate-500">DRE — Demonstração do Resultado do Exercício</span>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
              {/* Header */}
              <div className="bg-white/[0.04] border-b border-white/8 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-lg font-bold text-white">DRE — {monthLabel(mes)}</h3>
                  <div className={`text-sm font-bold ${resultadoLiquido >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    Resultado: {formatBRL(resultadoLiquido)}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {/* Receitas */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <TrendingUp className="h-4 w-4" /> Receitas
                    </div>
                    <div className="text-emerald-400 font-bold">{formatBRL(totalReceitas)}</div>
                  </div>
                  {dreReceitas.length === 0 ? (
                    <div className="text-xs text-slate-600 pl-6">Nenhuma receita registrada</div>
                  ) : (
                    <div className="space-y-1.5 pl-6">
                      {dreReceitas.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm">
                          <span className="text-slate-400">{m.descricao}</span>
                          <span className="text-slate-200 font-mono">{formatBRL(m.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Despesas */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <TrendingDown className="h-4 w-4" /> Despesas
                    </div>
                    <div className="text-red-400 font-bold">{formatBRL(totalDespesas)}</div>
                  </div>
                  {dreDespesas.length === 0 ? (
                    <div className="text-xs text-slate-600 pl-6">Nenhuma despesa registrada</div>
                  ) : (
                    <div className="space-y-1.5 pl-6">
                      {dreDespesas.map((m) => (
                        <div key={m.id} className="flex justify-between text-sm">
                          <span className="text-slate-400">{m.descricao}</span>
                          <span className="text-slate-200 font-mono">{formatBRL(m.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resultado */}
                <div className="px-6 py-5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-white">Resultado Líquido</span>
                    <span className={`font-display text-2xl font-bold ${resultadoLiquido >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatBRL(resultadoLiquido)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Report */}
        {activeReport === "categorias" && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
                {["3", "6", "12"].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${period === p ? "bg-primary text-white" : "text-slate-400 hover:text-white"}`}>
                    {p}m
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500">Últimos {period} meses</span>
            </div>

            {loadingTodos ? (
              <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {[{ label: "Receitas por Categoria", items: catReceitas, color: "emerald" },
                  { label: "Despesas por Categoria", items: catDespesas, color: "red" }].map(({ label, items, color }) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
                    <h3 className={`mb-4 font-display font-bold text-${color}-400`}>{label}</h3>
                    {items.length === 0 ? (
                      <div className="text-sm text-slate-600">Nenhum dado</div>
                    ) : (
                      <div className="space-y-3">
                        {items.map(([id, cat]) => (
                          <div key={id}>
                            <div className="flex items-center justify-between mb-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ background: cat.cor }} />
                                <span className="text-slate-300">{cat.nome}</span>
                              </div>
                              <span className="font-mono text-white">{formatBRL(cat.total)}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5">
                              <div
                                className={`h-full rounded-full bg-${color}-500/60`}
                                style={{ width: `${(cat.total / maxCatVal) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
