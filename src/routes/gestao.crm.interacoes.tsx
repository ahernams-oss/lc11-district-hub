import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, MessageSquare, PhoneCall, Users, Mail, MapPin, CheckCircle2, XCircle, Search, Clock, Calendar } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormActions } from "@/components/gestao/GestaoForm";
import { listCrmInteracoes, addCrmInteracao, listCrmContatos } from "@/lib/crm.functions";

export const Route = createFileRoute("/gestao/crm/interacoes")({
  component: CrmInteracoesPage,
});

const TIPO_INTERACAO: Record<string, { label: string; icon: any; cls: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageSquare, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  ligacao: { label: "Ligação", icon: PhoneCall, cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  reuniao: { label: "Reunião", icon: Users, cls: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  email: { label: "E-mail", icon: Mail, cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  visita_clube: { label: "Visita a Clube", icon: MapPin, cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  outro: { label: "Outro", icon: Clock, cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

function CrmInteracoesPage() {
  const qc = useQueryClient();
  const listInteracoes = useServerFn(listCrmInteracoes);
  const listContatos = useServerFn(listCrmContatos);
  const addInteracao = useServerFn(addCrmInteracao);

  const [drawer, setDrawer] = useState(false);
  const [tipoFilter, setTipoFilter] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [form, setForm] = useState({
    contato_id: "",
    tipo: "whatsapp" as any,
    titulo: "",
    descricao: "",
  });

  const { data: interacoes, isLoading } = useQuery({
    queryKey: ["crm-interacoes"],
    queryFn: () => listInteracoes({}),
  });

  const { data: contatos } = useQuery({
    queryKey: ["crm-contatos"],
    queryFn: () => listContatos({}),
  });

  const addMut = useMutation({
    mutationFn: (d: typeof form) => addInteracao({ data: d }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Interação registrada no histórico." });
      setDrawer(false);
      setForm({ contato_id: "", tipo: "whatsapp", titulo: "", descricao: "" });
      qc.invalidateQueries({ queryKey: ["crm-interacoes"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao registrar." }),
  });

  const filtered = (interacoes ?? []).filter((item) => {
    if (tipoFilter && item.tipo !== tipoFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.titulo.toLowerCase().includes(q) ||
        (item.descricao ?? "").toLowerCase().includes(q) ||
        (item.crm_contatos?.nome ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <GestaoHeader
        title="Histórico de Interações"
        subtitle="Registro de contatos, chamadas, mensagens no WhatsApp, reuniões e e-mails trocados com os membros e convidados."
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "CRM", to: "/gestao/crm" }, { label: "Interações" }]}
        actions={
          <button
            onClick={() => setDrawer(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Nova Interação
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, resumo ou nome do contato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </div>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary"
          >
            <option value="" className="bg-slate-900">Todos os Tipos</option>
            {Object.entries(TIPO_INTERACAO).map(([key, val]) => (
              <option key={key} value={key} className="bg-slate-900">{val.label}</option>
            ))}
          </select>
        </div>

        {/* Feed Timeline */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 shadow-xl space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando histórico...</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => {
                const config = TIPO_INTERACAO[item.tipo] ?? TIPO_INTERACAO.outro;
                const IconComponent = config.icon;

                return (
                  <div key={item.id} className="flex gap-4 rounded-xl border border-white/8 bg-white/5 p-4 items-start">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.cls}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-sm text-white">{item.titulo}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      {item.crm_contatos?.nome && (
                        <div className="text-xs font-semibold text-primary">
                          Contato: {item.crm_contatos.nome}
                        </div>
                      )}
                      {item.descricao && (
                        <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                          {item.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Nenhuma interação registrada.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Drawer: Nova Interação */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Nova Interação no CRM"
        subtitle="Registre uma conversa, ligação ou reunião realizada com o contato."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMut.mutate(form);
          }}
          className="space-y-4"
        >
          <Field label="Selecione o Contato / Membro" required>
            <FormSelect
              value={form.contato_id}
              onChange={(e) => setForm({ ...form, contato_id: e.target.value })}
              required
            >
              <option value="">Selecione um contato...</option>
              {(contatos ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>
              ))}
            </FormSelect>
          </Field>

          <Field label="Tipo de Interação" required>
            <FormSelect
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
            >
              {Object.entries(TIPO_INTERACAO).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </FormSelect>
          </Field>

          <Field label="Título / Assunto" required>
            <FormInput
              placeholder="Ex: Envio de proposta de filiação via WhatsApp"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </Field>

          <Field label="Detalhamento / Resumo da Conversa">
            <textarea
              rows={4}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Resumo do que foi conversado, alinhamentos, próximos passos..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </Field>

          <FormActions
            onCancel={() => setDrawer(false)}
            submitLabel={addMut.isPending ? "Registrando..." : "Registrar Interação"}
            loading={addMut.isPending}
          />
        </form>
      </Drawer>
    </div>
  );
}
