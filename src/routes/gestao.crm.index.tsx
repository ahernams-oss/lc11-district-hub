import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Award, CheckCircle2, DollarSign, Clock, ArrowRight, Kanban, Plus, PhoneCall } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import { getCrmDashboardMetrics, listCrmTarefas } from "@/lib/crm.functions";

export const Route = createFileRoute("/gestao/crm/")({
  component: CrmDashboardPage,
});

function CrmDashboardPage() {
  const getMetrics = useServerFn(getCrmDashboardMetrics);
  const getTarefas = useServerFn(listCrmTarefas);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["crm-metrics"],
    queryFn: () => getMetrics({}),
  });

  const { data: tarefas } = useQuery({
    queryKey: ["crm-tarefas"],
    queryFn: () => getTarefas({}),
  });

  const tarefasPendentes = (tarefas ?? []).filter((t) => t.status === "pendente").slice(0, 5);

  return (
    <div>
      <GestaoHeader
        title="CRM & Gestão de Relacionamento"
        subtitle="Acompanhamento de membros, prospecção de leões, parcerias institucionais e pipeline de contatos do Distrito LC-11."
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "CRM" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/gestao/crm/funil"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/5"
            >
              <Kanban className="h-4 w-4" /> Funil Kanban
            </Link>
            <Link
              to="/gestao/crm/contatos"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> Novo Contato
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GestaoStatCard
            label="Total de Contatos"
            value={isLoading ? "..." : (metrics?.totalContatos ?? 0).toString()}
            icon={Users}
            variant="info"
          />
          <GestaoStatCard
            label="Leões Ativos"
            value={isLoading ? "..." : (metrics?.membrosAtivos ?? 0).toString()}
            icon={Award}
            variant="success"
          />
          <GestaoStatCard
            label="Em Prospecção"
            value={isLoading ? "..." : (metrics?.emProspeccao ?? 0).toString()}
            icon={UserPlus}
            variant="warning"
          />
          <GestaoStatCard
            label="Tarefas Pendentes"
            value={isLoading ? "..." : (metrics?.tarefasPendentes ?? 0).toString()}
            icon={Clock}
            variant="default"
          />
        </div>

        {/* Funnel Pipeline Overview & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funil Visual */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Etapas do Funil de Prospecção</h3>
                <p className="text-xs text-slate-400">Distribuição de contatos nas etapas de integração leônica</p>
              </div>
              <Link to="/gestao/crm/funil" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver Kanban <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="text-xs font-semibold text-blue-400">1. Novo Contato</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.novo ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Recém-cadastrados</div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="text-xs font-semibold text-cyan-400">2. Primeiro Contato</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.primeiro_contato ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Abordagem inicial</div>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <div className="text-xs font-semibold text-indigo-400">3. Convidado Reunião</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.convidado_reuniao ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Convite enviado</div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="text-xs font-semibold text-amber-400">4. Visita Realizada</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.visita_realizada ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Esteve em reunião</div>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
                <div className="text-xs font-semibold text-violet-400">5. Proposta Enviada</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.proposta ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Ficha de filiação</div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="text-xs font-semibold text-emerald-400">6. Filiado (Convertido)</div>
                <div className="mt-1 text-2xl font-bold text-white">{metrics?.funilStats?.filiado ?? 0}</div>
                <div className="text-[11px] text-slate-400 mt-1">Novo Leão ativo</div>
              </div>
            </div>
          </div>

          {/* Próximos Follow-ups */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-primary" /> Follow-ups Prioritários
              </h3>
              <Link to="/gestao/crm/tarefas" className="text-xs text-primary hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {tarefasPendentes.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/8 bg-white/5 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{t.titulo}</span>
                    <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-400 font-medium">
                      {new Date(t.data_vencimento).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {t.crm_contatos?.nome && (
                    <div className="text-[11px] text-slate-400">Contato: {t.crm_contatos.nome}</div>
                  )}
                </div>
              ))}
              {tarefasPendentes.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Nenhum follow-up pendente para hoje.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
