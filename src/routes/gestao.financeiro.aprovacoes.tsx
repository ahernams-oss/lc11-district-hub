import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Paperclip,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  DollarSign,
  Search,
  Filter,
  Check,
  X,
  Eye,
  MessageSquare,
} from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { GestaoStatCard } from "@/components/gestao/GestaoStatCard";
import { listDespesasAprovacao, aprovarDespesa, rejeitarDespesa } from "@/lib/aprovacoes.functions";

export const Route = createFileRoute("/gestao/financeiro/aprovacoes")({
  component: GestaoAprovacoesPage,
});

function GestaoAprovacoesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pendente");
  const [search, setSearch] = useState("");

  // Modal State
  const [aprovarModal, setAprovarModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [rejeitarModal, setRejeitarModal] = useState<{ open: boolean; item?: any }>({ open: false });

  const [parecerTexto, setParecerTexto] = useState("");
  const [solicitarRevisao, setSolicitarRevisao] = useState(false);

  const { data: despesas, isLoading } = useQuery({
    queryKey: ["despesas-aprovacao", activeTab],
    queryFn: () => listDespesasAprovacao({ data: { status_aprovacao: activeTab } }),
  });

  const aprovarMutation = useMutation({
    mutationFn: (vars: { id: string; parecer?: string | null }) => aprovarDespesa({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas-aprovacao"] });
      setAprovarModal({ open: false });
      setParecerTexto("");
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: (vars: { id: string; parecer: string; solicitar_revisao?: boolean }) =>
      rejeitarDespesa({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["despesas-aprovacao"] });
      setRejeitarModal({ open: false });
      setParecerTexto("");
    },
  });

  const handleOpenAprovar = (item: any) => {
    setParecerTexto("Aprovado pela Governadoria Distrital LC-11.");
    setAprovarModal({ open: true, item });
  };

  const handleOpenRejeitar = (item: any) => {
    setParecerTexto("");
    setSolicitarRevisao(false);
    setRejeitarModal({ open: true, item });
  };

  const handleConfirmAprovar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aprovarModal.item) return;
    aprovarMutation.mutate({
      id: aprovarModal.item.id,
      parecer: parecerTexto,
    });
  };

  const handleConfirmRejeitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejeitarModal.item) return;
    if (!parecerTexto.trim()) {
      alert("Por favor, digite o motivo da rejeição ou revisão.");
      return;
    }
    rejeitarMutation.mutate({
      id: rejeitarModal.item.id,
      parecer: parecerTexto,
      solicitar_revisao: solicitarRevisao,
    });
  };

  // KPIs
  const despesasPendentes = despesas?.filter((d) => d.status_aprovacao === "pendente") || [];
  const despesasAprovadas = despesas?.filter((d) => d.status_aprovacao === "aprovado") || [];
  const despesasRejeitadas = despesas?.filter((d) => d.status_aprovacao === "rejeitado" || d.status_aprovacao === "revisao") || [];

  const totalPendente = despesasPendentes.reduce((acc, d) => acc + (d.valor || 0), 0);
  const totalAprovado = despesasAprovadas.reduce((acc, d) => acc + (d.valor || 0), 0);

  const filteredList = despesas?.filter((item) => {
    const matchesSearch =
      item.descricao.toLowerCase().includes(search.toLowerCase()) ||
      (item.fornecedor && item.fornecedor.toLowerCase().includes(search.toLowerCase())) ||
      (item.solicitante_nome && item.solicitante_nome.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pb-12">
      <GestaoHeader title="Aprovação de Despesas — Governadoria" breadcrumbs={["Gestão", "Financeiro", "Aprovação de Despesas"]} />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GestaoStatCard
            title="Pendentes de Aprovação"
            value={`${despesasPendentes.length} solicitações`}
            subtitle={`R$ ${(totalPendente / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} aguardando`}
            icon={Clock}
            color="amber"
          />
          <GestaoStatCard
            title="Despesas Aprovadas"
            value={`R$ ${(totalAprovado / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            subtitle={`${despesasAprovadas.length} aprovadas no período`}
            icon={CheckCircle2}
            color="green"
          />
          <GestaoStatCard
            title="Rejeitadas / Revisão"
            value={`${despesasRejeitadas.length} despesas`}
            subtitle="Devolvidas à tesouraria"
            icon={XCircle}
            color="red"
          />
          <GestaoStatCard
            title="Tempo Médio de Análise"
            value="< 24 horas"
            subtitle="Agilidade na governadoria"
            icon={ShieldCheck}
            color="blue"
          />
        </div>

        {/* Abas de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("pendente")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "pendente"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Pendentes de Aprovação
              {despesasPendentes.length > 0 && (
                <span className="ml-1 rounded-full bg-slate-950/20 px-2 py-0.5 text-[10px] font-bold">
                  {despesasPendentes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("aprovado")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "aprovado"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aprovadas
            </button>

            <button
              onClick={() => setActiveTab("rejeitado")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "rejeitado"
                  ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Rejeitadas / Devolvidas
            </button>

            <button
              onClick={() => setActiveTab("todos")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "todos"
                  ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              Todas
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por descrição, fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Lista de Solicitações de Despesas */}
        <div className="rounded-xl border border-white/8 bg-[#0d1321] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Solicitações de Aprovação de Despesas
              </h3>
              <p className="text-xs text-slate-400">
                Aprovação oficial da Governadoria para autorização de pagamentos pela tesouraria
              </p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
              Fluxo da Governadoria Distrital
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando solicitações de despesas...</div>
          ) : filteredList?.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Nenhuma solicitação de despesa encontrada com o filtro selecionado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList?.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-5 transition-all shadow-md ${
                    item.status_aprovacao === "aprovado"
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : item.status_aprovacao === "rejeitado"
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : item.status_aprovacao === "revisao"
                      ? "border-amber-500/30 bg-amber-500/[0.02]"
                      : "border-white/10 bg-white/[0.02] hover:border-primary/40"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            item.status_aprovacao === "aprovado"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status_aprovacao === "rejeitado"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : item.status_aprovacao === "revisao"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {item.status_aprovacao === "aprovado"
                            ? "✓ Aprovado pela Governadoria"
                            : item.status_aprovacao === "rejeitado"
                            ? "✕ Rejeitado"
                            : item.status_aprovacao === "revisao"
                            ? "⚠ Em Revisão"
                            : "⏳ Aguardando Aprovação do Governador"}
                        </span>

                        {item.solicitante_nome && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <User className="h-3.5 w-3.5 text-slate-500" /> Solicitado por: {item.solicitante_nome}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-white leading-snug">{item.descricao}</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 pt-1">
                        <div>
                          <span className="text-slate-500 block">Fornecedor / Favorecido:</span>
                          <span className="font-semibold text-slate-200">{item.fornecedor || "Não informado"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Vencimento da Despesa:</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-500" />
                            {new Date(item.vencimento).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Documento Fiscal:</span>
                          <span className="font-semibold text-slate-200">{item.documento || "Sem documento anexado"}</span>
                        </div>
                      </div>

                      {item.observacoes && (
                        <p className="text-xs text-slate-400 bg-white/5 p-2.5 rounded-lg border border-white/5">
                          <span className="font-semibold text-slate-300">Justificativa da Solicitação:</span> {item.observacoes}
                        </p>
                      )}

                      {item.parecer_governador && (
                        <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                          <span className="font-semibold">Parecer da Governadoria:</span> {item.parecer_governador}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-6 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-medium">Valor Solicitado</span>
                        <span className="font-display text-2xl font-extrabold text-emerald-400">
                          R$ {((item.valor || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {item.anexo_url && (
                          <a
                            href={item.anexo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1"
                            title="Visualizar anexo/recibo"
                          >
                            <Paperclip className="h-4 w-4" />
                            Anexo
                          </a>
                        )}

                        {item.status_aprovacao === "pendente" && (
                          <>
                            <button
                              onClick={() => handleOpenRejeitar(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </button>

                            <button
                              onClick={() => handleOpenAprovar(item)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Aprovar Despesa
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Aprovação */}
      {aprovarModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0d1321] border border-emerald-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <h3 className="font-display text-lg font-bold text-white">Aprovar Despesa — Governadoria</h3>
              </div>
              <button
                onClick={() => setAprovarModal({ open: false })}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-xs text-emerald-300">
              Você está aprovando a solicitação de pagamento para <strong>{aprovarModal.item?.descricao}</strong> no valor de <strong>R$ {((aprovarModal.item?.valor || 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>.
            </div>

            <form onSubmit={handleConfirmAprovar} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Parecer / Despacho da Governadoria</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Despesa aprovada conforme planejamento orçamentário..."
                  value={parecerTexto}
                  onChange={(e) => setParecerTexto(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAprovarModal({ open: false })}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={aprovarMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {aprovarMutation.isPending ? "Confirmando..." : "Confirmar Aprovação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rejeição ou Devolução para Revisão */}
      {rejeitarModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0d1321] border border-rose-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
                <h3 className="font-display text-lg font-bold text-white">Rejeitar ou Devolver Despesa</h3>
              </div>
              <button
                onClick={() => setRejeitarModal({ open: false })}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejeitar} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Motivo / Parecer do Indeferimento *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique o motivo do indeferimento ou quais dados precisam ser corrigidos..."
                  value={parecerTexto}
                  onChange={(e) => setParecerTexto(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="revisaoCheck"
                  checked={solicitarRevisao}
                  onChange={(e) => setSolicitarRevisao(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="revisaoCheck" className="text-slate-300 font-medium cursor-pointer">
                  Marcar como "Solicitar Revisão" (devolve para a tesouraria reajustar sem cancelar o registro)
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejeitarModal({ open: false })}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={rejeitarMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {rejeitarMutation.isPending ? "Gravando..." : "Confirmar Indeferimento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
