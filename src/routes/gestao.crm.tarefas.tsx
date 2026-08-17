import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, CheckSquare, Square, Clock, CheckCircle2, XCircle, Search, Calendar, PhoneCall, MessageSquare, Mail } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { listCrmTarefas, upsertCrmTarefa, toggleCrmTarefaStatus, listCrmContatos } from "@/lib/crm.functions";

export const Route = createFileRoute("/gestao/crm/tarefas")({
  component: CrmTarefasPage,
});

type Tarefa = Awaited<ReturnType<typeof listCrmTarefas>>[number];

const TIPO_TAREFA: Record<string, { label: string; icon: any; cls: string }> = {
  ligacao: { label: "Ligação", icon: PhoneCall, cls: "bg-blue-500/15 text-blue-400" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, cls: "bg-emerald-500/15 text-emerald-400" },
  reuniao: { label: "Reunião", icon: Calendar, cls: "bg-violet-500/15 text-violet-400" },
  email: { label: "E-mail", icon: Mail, cls: "bg-purple-500/15 text-purple-400" },
  tarefa: { label: "Tarefa Geral", icon: CheckSquare, cls: "bg-slate-500/15 text-slate-400" },
};

function CrmTarefasPage() {
  const qc = useQueryClient();
  const listTarefas = useServerFn(listCrmTarefas);
  const listContatos = useServerFn(listCrmContatos);
  const upsertTarefa = useServerFn(upsertCrmTarefa);
  const toggleStatus = useServerFn(toggleCrmTarefaStatus);

  const [drawer, setDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pendente");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [form, setForm] = useState({
    id: undefined as string | undefined,
    contato_id: "",
    titulo: "",
    descricao: "",
    data_vencimento: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    tipo: "ligacao" as any,
    status: "pendente" as any,
  });

  const { data: tarefas, isLoading } = useQuery({
    queryKey: ["crm-tarefas"],
    queryFn: () => listTarefas({}),
  });

  const { data: contatos } = useQuery({
    queryKey: ["crm-contatos"],
    queryFn: () => listContatos({}),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsertTarefa({ data: d }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Follow-up agendado com sucesso." });
      setDrawer(false);
      setForm({
        id: undefined,
        contato_id: "",
        titulo: "",
        descricao: "",
        data_vencimento: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        tipo: "ligacao",
        status: "pendente",
      });
      qc.invalidateQueries({ queryKey: ["crm-tarefas"] });
      qc.invalidateQueries({ queryKey: ["crm-metrics"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao agendar." }),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { id: string; status: "pendente" | "concluida" | "cancelada" }) => toggleStatus({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-tarefas"] });
      qc.invalidateQueries({ queryKey: ["crm-metrics"] });
    },
  });

  const filtered = (tarefas ?? []).filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.titulo.toLowerCase().includes(q) ||
        (t.descricao ?? "").toLowerCase().includes(q) ||
        (t.crm_contatos?.nome ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <GestaoHeader
        title="Tarefas & Follow-up"
        subtitle="Lembretes de chamadas, envios de ficha, convites para reuniões e compromissos com contatos do CRM."
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "CRM", to: "/gestao/crm" }, { label: "Tarefas" }]}
        actions={
          <button
            onClick={() => setDrawer(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Novo Follow-up
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {msg && (
          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por tarefa, lembrete ou contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary"
          >
            <option value="pendente" className="bg-slate-900">Pendentes</option>
            <option value="concluida" className="bg-slate-900">Concluídas</option>
            <option value="cancelada" className="bg-slate-900">Canceladas</option>
            <option value="" className="bg-slate-900">Todas as Tarefas</option>
          </select>
        </div>

        {/* Tarefas List */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 shadow-xl space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando tarefas...</div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((t) => {
                const config = TIPO_TAREFA[t.tipo] ?? TIPO_TAREFA.tarefa;
                const IconComponent = config.icon;
                const isConcluida = t.status === "concluida";

                return (
                  <div
                    key={t.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                      isConcluida ? "border-white/5 bg-white/[0.01] opacity-60" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <button
                      onClick={() =>
                        toggleMut.mutate({
                          id: t.id,
                          status: isConcluida ? "pendente" : "concluida",
                        })
                      }
                      disabled={toggleMut.isPending}
                      className="mt-0.5 text-slate-400 hover:text-primary transition-colors"
                    >
                      {isConcluida ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className={`font-semibold text-xs text-white ${isConcluida ? "line-through text-slate-400" : ""}`}>
                          {t.titulo}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          <Clock className="h-3 w-3" />
                          {new Date(t.data_vencimento).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      {t.crm_contatos?.nome && (
                        <div className="text-[11px] font-medium text-slate-300">
                          Contato: {t.crm_contatos.nome}
                        </div>
                      )}

                      {t.descricao && (
                        <p className="text-[11px] text-slate-400">{t.descricao}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Nenhuma tarefa encontrada.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer: Novo Follow-up */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Novo Follow-up / Lembrete"
        subtitle="Agende uma ação com data e hora de vencimento para acompanhamento no CRM."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate(form);
          }}
          className="space-y-4"
        >
          <Field label="Contato Relacionado" required>
            <FormSelect
              value={form.contato_id}
              onChange={(e) => setForm({ ...form, contato_id: e.target.value })}
              required
            >
              <option value="">Selecione o contato...</option>
              {(contatos ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </FormSelect>
          </Field>

          <FormRow>
            <Field label="Tipo da Tarefa" required>
              <FormSelect
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
              >
                {Object.entries(TIPO_TAREFA).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Data e Hora Vencimento" required>
              <FormInput
                type="datetime-local"
                value={form.data_vencimento}
                onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                required
              />
            </Field>
          </FormRow>

          <Field label="Título / Ação" required>
            <FormInput
              placeholder="Ex: Ligar para confirmar presença na Reunião Festiva"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </Field>

          <Field label="Orientações / Detalhes">
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Instruções sobre o que falar ou verificar..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </Field>

          <FormActions
            onCancel={() => setDrawer(false)}
            submitLabel={saveMut.isPending ? "Agendando..." : "Agendar Follow-up"}
            loading={saveMut.isPending}
          />
        </form>
      </Drawer>
    </div>
  );
}
