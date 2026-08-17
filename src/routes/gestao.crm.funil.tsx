import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Kanban, ArrowRight, ArrowLeft, CheckCircle2, User, Building2, Phone, Mail, MessageSquare } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { listCrmContatos, updateContatoEstagio } from "@/lib/crm.functions";

export const Route = createFileRoute("/gestao/crm/funil")({
  component: CrmFunilPage,
});

const COLUNAS_FUNIL = [
  { id: "novo", label: "1. Novo Contato", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
  { id: "primeiro_contato", label: "2. 1º Contato", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400" },
  { id: "convidado_reuniao", label: "3. Convidado", color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-400" },
  { id: "visita_realizada", label: "4. Visita", color: "border-amber-500/30 bg-amber-500/5 text-amber-400" },
  { id: "proposta", label: "5. Proposta", color: "border-violet-500/30 bg-violet-500/5 text-violet-400" },
  { id: "filiado", label: "6. Filiado!", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400" },
] as const;

function CrmFunilPage() {
  const qc = useQueryClient();
  const list = useServerFn(listCrmContatos);
  const updateEstagio = useServerFn(updateContatoEstagio);

  const { data: contatos, isLoading } = useQuery({
    queryKey: ["crm-contatos"],
    queryFn: () => list({}),
  });

  const moveMut = useMutation({
    mutationFn: (vars: { id: string; estagio_funil: any }) => updateEstagio({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-contatos"] });
      qc.invalidateQueries({ queryKey: ["crm-metrics"] });
    },
  });

  function getNextStage(current: string): string | null {
    const idx = COLUNAS_FUNIL.findIndex((c) => c.id === current);
    if (idx !== -1 && idx < COLUNAS_FUNIL.length - 1) {
      return COLUNAS_FUNIL[idx + 1].id;
    }
    return null;
  }

  function getPrevStage(current: string): string | null {
    const idx = COLUNAS_FUNIL.findIndex((c) => c.id === current);
    if (idx > 0) {
      return COLUNAS_FUNIL[idx - 1].id;
    }
    return null;
  }

  return (
    <div>
      <GestaoHeader
        title="Funil de Prospecção (Kanban)"
        subtitle="Mova os contatos entre as etapas do funil leônico desde o primeiro contato até a filiação definitiva."
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "CRM", to: "/gestao/crm" }, { label: "Funil Kanban" }]}
      />

      <div className="p-6 overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Carregando funil...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[1200px]">
            {COLUNAS_FUNIL.map((col) => {
              const colContatos = (contatos ?? []).filter((c) => c.estagio_funil === col.id);

              return (
                <div key={col.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-3 space-y-3 min-h-[500px]">
                  {/* Column Header */}
                  <div className={`rounded-xl border p-3 flex items-center justify-between ${col.color}`}>
                    <span className="text-xs font-bold">{col.label}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                      {colContatos.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-3">
                    {colContatos.map((card) => {
                      const next = getNextStage(card.estagio_funil);
                      const prev = getPrevStage(card.estagio_funil);
                      const cleanPhone = (card.whatsapp || card.telefone || "").replace(/\D/g, "");

                      return (
                        <div
                          key={card.id}
                          className="rounded-xl border border-white/8 bg-white/5 p-3.5 space-y-2 hover:border-primary/40 transition-all shadow-lg"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-xs text-white leading-tight">{card.nome}</span>
                            {card.valor_estimado > 0 && (
                              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                                R$ {Number(card.valor_estimado).toLocaleString("pt-BR")}
                              </span>
                            )}
                          </div>

                          {card.cargo && <div className="text-[11px] text-slate-300 font-medium">{card.cargo}</div>}
                          {card.clube_nome && <div className="text-[10px] text-slate-400">{card.clube_nome}</div>}

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/55${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline pt-1"
                            >
                              <MessageSquare className="h-3 w-3" /> WhatsApp
                            </a>
                          )}

                          {/* Controls to shift stage */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            {prev ? (
                              <button
                                onClick={() => moveMut.mutate({ id: card.id, estagio_funil: prev })}
                                disabled={moveMut.isPending}
                                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                                title="Voltar etapa"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            ) : <div />}

                            {next ? (
                              <button
                                onClick={() => moveMut.mutate({ id: card.id, estagio_funil: next })}
                                disabled={moveMut.isPending}
                                className="rounded bg-primary/20 p-1 text-primary hover:bg-primary hover:text-white transition-colors"
                                title="Avançar etapa"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> Filiado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {colContatos.length === 0 && (
                      <div className="py-12 text-center text-[11px] text-slate-500 italic border border-dashed border-white/5 rounded-xl">
                        Nenhum contato nesta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
