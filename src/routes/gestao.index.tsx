import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import {
  DollarSign,
  BookOpen,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  BarChart3,
  FileText,
  UserPlus,
} from "lucide-react";
import { getFinanceiroDashboard } from "@/lib/financeiro.functions";
import { getContabilDashboard } from "@/lib/contabil.functions";
import { getCrmDashboardMetrics } from "@/lib/crm.functions";
import { formatBRL } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/")({
  component: GestaoDashboard,
});

function GestaoDashboard() {
  const { isGestorFinanceiro, isGestorContabil, isGestorCRM } = useAuth();

  const fetchFin = useServerFn(getFinanceiroDashboard);
  const fetchCon = useServerFn(getContabilDashboard);
  const fetchCrm = useServerFn(getCrmDashboardMetrics);

  const fin = useQuery({
    queryKey: ["gestao-dashboard-financeiro"],
    queryFn: () => fetchFin({}),
    enabled: !!isGestorFinanceiro,
    refetchInterval: 60_000,
  });

  const con = useQuery({
    queryKey: ["gestao-dashboard-contabil"],
    queryFn: () => fetchCon({}),
    enabled: !!isGestorContabil,
    refetchInterval: 60_000,
  });

  const crm = useQuery({
    queryKey: ["gestao-dashboard-crm"],
    queryFn: () => fetchCrm({}),
    enabled: !!isGestorCRM,
    refetchInterval: 60_000,
  });

  const dash = (v: string | undefined) => v ?? "—";

  return (
    <div>
      <GestaoHeader
        title="Dashboard"
        subtitle="Visão geral do Sistema de Gestão do Distrito LC-11"
      />

      <div className="p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isGestorFinanceiro && (
            <>
              <GestaoStatCard
                label="Saldo em Caixa"
                value={dash(fin.data ? formatBRL(fin.data.saldoTotal) : undefined)}
                icon={DollarSign}
                variant="success"
                loading={fin.isLoading}
              />
              <GestaoStatCard
                label="Contas a Vencer (7d)"
                value={dash(fin.data ? formatBRL(fin.data.aVencer7d) : undefined)}
                icon={AlertTriangle}
                variant="warning"
                loading={fin.isLoading}
              />
            </>
          )}
          {isGestorContabil && (
            <GestaoStatCard
              label="Lançamentos (mês)"
              value={dash(con.data ? String(con.data.totalLancamentosMes) : undefined)}
              icon={BookOpen}
              variant="info"
              loading={con.isLoading}
            />
          )}
          {isGestorCRM && (
            <GestaoStatCard
              label="Contatos Ativos"
              value={dash(crm.data ? String(crm.data.totalContatos) : undefined)}
              icon={Users}
              variant="default"
              loading={crm.isLoading}
            />
          )}
        </div>

        {/* Module Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {isGestorFinanceiro && (
            <ModuleCard
              title="Financeiro"
              description="Controle de contas a pagar/receber, fluxo de caixa, orçamento e cobranças."
              icon={DollarSign}
              color="emerald"
              to="/gestao/financeiro"
              stats={[
                { icon: TrendingUp, label: "Entradas (mês)", value: dash(fin.data ? formatBRL(fin.data.entradas) : undefined) },
                { icon: AlertTriangle, label: "Contas Vencidas", value: dash(fin.data ? formatBRL(fin.data.vencidas) : undefined) },
                { icon: CheckCircle2, label: "Saídas (mês)", value: dash(fin.data ? formatBRL(fin.data.saidas) : undefined) },
              ]}
            />
          )}

          {isGestorContabil && (
            <ModuleCard
              title="Contábil"
              description="Plano de contas, lançamentos em partida dobrada, conciliação e balancete."
              icon={BookOpen}
              color="blue"
              to="/gestao/contabil"
              stats={[
                { icon: FileText, label: "Lançamentos (mês)", value: dash(con.data ? String(con.data.totalLancamentosMes) : undefined) },
                { icon: BarChart3, label: "Contas no plano", value: dash(con.data ? String(con.data.totalContas) : undefined) },
                { icon: Clock, label: "Movimento (mês)", value: dash(con.data ? formatBRL(con.data.movimentoMes) : undefined) },
              ]}
            />
          )}

          {isGestorCRM && (
            <ModuleCard
              title="CRM"
              description="Cadastro de membros, pipeline de prospecção, interações e follow-ups."
              icon={Users}
              color="violet"
              to="/gestao/crm"
              stats={[
                { icon: UserPlus, label: "Membros ativos", value: dash(crm.data ? String(crm.data.membrosAtivos) : undefined) },
                { icon: Clock, label: "Follow-ups pendentes", value: dash(crm.data ? String(crm.data.tarefasPendentes) : undefined) },
                { icon: TrendingUp, label: "Em prospecção", value: dash(crm.data ? String(crm.data.emProspeccao) : undefined) },
              ]}
            />
          )}
        </div>


        {/* Recent Activity */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03]">
          <div className="border-b border-white/8 px-6 py-4">
            <h2 className="font-display text-lg font-bold text-white">Atividade Recente</h2>
          </div>
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            As atividades recentes aparecerão aqui quando os módulos estiverem configurados.
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  icon: Icon,
  color,
  to,
  stats,
}: {
  title: string;
  description: string;
  icon: any;
  color: "emerald" | "blue" | "violet";
  to: string;
  stats: { icon: any; label: string; value: string }[];
}) {
  const colorMap = {
    emerald: {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-400",
      border: "hover:border-emerald-500/30",
      glow: "group-hover:shadow-emerald-500/5",
    },
    blue: {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-400",
      border: "hover:border-blue-500/30",
      glow: "group-hover:shadow-blue-500/5",
    },
    violet: {
      iconBg: "bg-violet-500/10",
      iconText: "text-violet-400",
      border: "hover:border-violet-500/30",
      glow: "group-hover:shadow-violet-500/5",
    },
  };

  const c = colorMap[color];

  return (
    <Link
      to={to}
      className={`group rounded-xl border border-white/8 bg-white/[0.03] p-6 transition-all ${c.border} ${c.glow} hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}>
          <Icon className={`h-6 w-6 ${c.iconText}`} />
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-slate-400" />
      </div>

      <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 leading-relaxed">{description}</p>

      <div className="mt-5 space-y-2 border-t border-white/8 pt-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <stat.icon className="h-3.5 w-3.5" />
              {stat.label}
            </div>
            <span className="font-medium text-slate-300">{stat.value}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}
