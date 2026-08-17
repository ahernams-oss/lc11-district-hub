import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import { StatusBadge } from "@/components/gestao/StatusBadge";
import { BookOpen, FileSpreadsheet, ArrowLeftRight, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { getContabilDashboard } from "@/lib/contabil.functions";
import { formatBRL, formatDate, monthLabel } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/contabil/")({
  component: ContabilDashboardPage,
});

const QUICK_LINKS = [
  { to: "/gestao/contabil/plano-contas", label: "Plano de Contas", color: "text-indigo-400", icon: BookOpen },
  { to: "/gestao/contabil/lancamentos",  label: "Lançamentos",      color: "text-blue-400",   icon: ArrowLeftRight },
  { to: "/gestao/contabil/balancete",    label: "Balancete",        color: "text-emerald-400", icon: FileSpreadsheet },
];

function ContabilDashboardPage() {
  const fetchDashboard = useServerFn(getContabilDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["contabil-dashboard"],
    queryFn: () => fetchDashboard({}),
  });

  return (
    <div>
      <GestaoHeader
        title="Módulo Contábil"
        subtitle="Escrituração contábil em partida dobrada, balancetes e conciliação"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Contábil" }]}
      />

      <div className="p-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GestaoStatCard
            label="Plano de Contas"
            value={isLoading ? "..." : `${data?.totalContas ?? 0} contas`}
            icon={BookOpen}
            variant="default"
            loading={isLoading}
          />
          <GestaoStatCard
            label={`Lançamentos (${data?.mes ? monthLabel(data.mes) : ""})`}
            value={isLoading ? "..." : `${data?.totalLancamentosMes ?? 0} lançamentos`}
            icon={ArrowLeftRight}
            variant="info"
            loading={isLoading}
          />
          <GestaoStatCard
            label={`Movimentação (${data?.mes ? monthLabel(data.mes) : ""})`}
            value={isLoading ? "..." : formatBRL(data?.movimentoMes ?? 0)}
            icon={FileSpreadsheet}
            variant="success"
            loading={isLoading}
          />
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:border-indigo-500/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <l.icon className={`h-5 w-5 ${l.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">{l.label}</div>
                <div className="text-xs text-slate-500">Acessar módulo</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </Link>
          ))}
        </div>

        {/* Recent journal entries */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Lançamentos Recentes</h2>
            <Link to="/gestao/contabil/lancamentos" className="text-xs text-primary hover:underline">
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando...</div>
          ) : (data?.recentes?.length ?? 0) === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Nenhum lançamento registrado.{" "}
              <Link to="/gestao/contabil/lancamentos" className="text-primary underline">Registrar primeiro lançamento</Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(data?.recentes ?? []).map((l: any) => {
                const totalValor = (l.itens ?? [])
                  .filter((i: any) => i.tipo === "debito")
                  .reduce((s: number, i: any) => s + i.valor, 0);

                return (
                  <div key={l.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-500">#{l.numero}</span>
                        <span className="font-medium text-white text-sm">{l.historico}</span>
                        <StatusBadge status={l.status} />
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 mr-2">{formatDate(l.data)}</span>
                        <span className="font-mono text-sm font-bold text-white">{formatBRL(totalValor)}</span>
                      </div>
                    </div>
                    {/* Item lines */}
                    <div className="pl-6 space-y-1">
                      {(l.itens ?? []).map((i: any) => (
                        <div key={i.id} className="flex items-center justify-between text-xs text-slate-400 font-mono">
                          <span>
                            <span className={i.tipo === "debito" ? "text-emerald-400 font-bold mr-1" : "text-red-400 font-bold mr-1"}>
                              {i.tipo === "debito" ? "D" : "C"}
                            </span>
                            {i.conta?.codigo} — {i.conta?.nome}
                          </span>
                          <span>{formatBRL(i.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
