import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  Wallet, ArrowRight, Users2, RefreshCw,
} from "lucide-react";
import { getFinanceiroDashboard } from "@/lib/financeiro.functions";
import { formatBRL, monthLabel } from "@/lib/financeiro.utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gestao/financeiro/")({
  component: FinanceiroDashboard,
});

const QUICK_LINKS = [
  { to: "/gestao/financeiro/contas-pagar",   label: "Contas a Pagar",   color: "text-red-400",    icon: TrendingDown },
  { to: "/gestao/financeiro/contas-receber", label: "Contas a Receber", color: "text-emerald-400", icon: TrendingUp   },
  { to: "/gestao/financeiro/movimentacoes",  label: "Movimentações",    color: "text-blue-400",    icon: DollarSign   },
  { to: "/gestao/financeiro/cobrancas",      label: "Cobranças",        color: "text-violet-400",  icon: Users2       },
];

function FinanceiroDashboard() {
  const queryClient = useQueryClient();
  const fetchDashboard = useServerFn(getFinanceiroDashboard);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["financeiro-dashboard"],
    queryFn: () => fetchDashboard({}),
    refetchInterval: 30_000,
    staleTime: 0,
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime-financeiro-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "fin_movimentacoes" }, () => {
        queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fin_contas_pagar" }, () => {
        queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fin_contas_receber" }, () => {
        queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "fin_cobrancas" }, () => {
        queryClient.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div>
      <GestaoHeader
        title="Módulo Financeiro"
        subtitle="Controle financeiro completo do Distrito LC-11"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro" }]}
        actions={
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`} />
            {isRefetching ? "Atualizando..." : "Atualizar Dashboard"}
          </button>
        }
      />

      <div className="p-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GestaoStatCard
            label="Saldo Total"
            value={isLoading ? "..." : formatBRL(data?.saldoTotal ?? 0)}
            icon={Wallet}
            variant={data && data.saldoTotal < 0 ? "danger" : "success"}
            loading={isLoading}
          />
          <GestaoStatCard
            label={`Receitas (${data?.mes ? monthLabel(data.mes) : ""})`}
            value={isLoading ? "..." : formatBRL(data?.entradas ?? 0)}
            icon={TrendingUp}
            variant="success"
            loading={isLoading}
          />
          <GestaoStatCard
            label={`Despesas (${data?.mes ? monthLabel(data.mes) : ""})`}
            value={isLoading ? "..." : formatBRL(data?.saidas ?? 0)}
            icon={TrendingDown}
            variant="danger"
            loading={isLoading}
          />
          <GestaoStatCard
            label="Vencer em 7 dias"
            value={isLoading ? "..." : formatBRL(data?.aVencer7d ?? 0)}
            icon={AlertTriangle}
            variant={data && data.aVencer7d > 0 ? "warning" : "default"}
            loading={isLoading}
          />
        </div>

        {/* Secondary KPIs */}
        {!isLoading && (data?.vencidas ?? 0) > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-white">
                {formatBRL(data!.vencidas)} em contas vencidas não pagas
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Verifique as contas a pagar em atraso
              </div>
            </div>
            <Link to="/gestao/financeiro/contas-pagar" className="ml-auto text-xs text-red-400 hover:underline">
              Ver &rarr;
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
            >
              <l.icon className={`h-5 w-5 shrink-0 ${l.color}`} />
              <span className="flex-1 text-sm font-medium text-slate-200">{l.label}</span>
              <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </Link>
          ))}
        </div>

        {/* Cash flow chart */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03]">
          <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Fluxo de Caixa — Últimos 6 meses</h2>
            <Link to="/gestao/financeiro/fluxo-caixa" className="text-xs text-primary hover:underline">
              Ver completo →
            </Link>
          </div>
          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (data?.fluxo?.length ?? 0) === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Nenhuma movimentação registrada. Cadastre movimentações para ver o fluxo.
            </div>
          ) : (
            <div className="px-6 py-5">
              <MiniFluxoChart fluxo={data!.fluxo} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniFluxoChart({ fluxo }: { fluxo: { mes: string; entrada: number; saida: number; saldo: number }[] }) {
  const max = Math.max(...fluxo.map((f) => Math.max(f.entrada, f.saida)), 1);

  return (
    <div className="space-y-2">
      {fluxo.map((f) => (
        <div key={f.mes} className="flex items-center gap-4">
          <div className="w-12 shrink-0 text-right text-xs text-slate-500">{monthLabel(f.mes)}</div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="h-2.5 rounded-full bg-emerald-500/70" style={{ width: `${(f.entrada / max) * 100}%`, minWidth: f.entrada > 0 ? "4px" : "0" }} />
              <span className="text-[10px] text-emerald-400">{formatBRL(f.entrada)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 rounded-full bg-red-500/70" style={{ width: `${(f.saida / max) * 100}%`, minWidth: f.saida > 0 ? "4px" : "0" }} />
              <span className="text-[10px] text-red-400">{formatBRL(f.saida)}</span>
            </div>
          </div>
          <div className={`w-24 shrink-0 text-right text-xs font-semibold ${f.saldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatBRL(f.saldo)}
          </div>
        </div>
      ))}
    </div>
  );
}
