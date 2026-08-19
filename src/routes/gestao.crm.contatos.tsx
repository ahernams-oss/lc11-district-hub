import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, CheckCircle2, XCircle, Users, Award, Building2, Phone, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { listCrmContatos, upsertCrmContato, deleteCrmContato } from "@/lib/crm.functions";

export const Route = createFileRoute("/gestao/crm/contatos")({
  component: CrmContatosPage,
});

type Contato = Awaited<ReturnType<typeof listCrmContatos>>[number];

const TIPO_OPTIONS = [
  { value: "membro", label: "Membro (Leão / Leo)" },
  { value: "prospeccao", label: "Prospecção (Convidado)" },
  { value: "doador_parceiro", label: "Doador / Patrocinador" },
  { value: "autoridade", label: "Autoridade / Órgão Público" },
  { value: "outro", label: "Outro" },
] as const;

const ESTAGIO_OPTIONS = [
  { value: "novo", label: "Novo Contato" },
  { value: "primeiro_contato", label: "Primeiro Contato" },
  { value: "convidado_reuniao", label: "Convidado Reunião" },
  { value: "visita_realizada", label: "Visita Realizada" },
  { value: "proposta", label: "Proposta de Filiação" },
  { value: "filiado", label: "Filiado (Convertido)" },
  { value: "perdido", label: "Perdido / Desistiu" },
] as const;

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "convertido", label: "Convertido" },
  { value: "inativo", label: "Inativo" },
] as const;

const TIPO_BADGE: Record<string, { label: string; cls: string }> = {
  membro: { label: "Membro Leão", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  prospeccao: { label: "Prospecção", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  doador_parceiro: { label: "Patrocinador", cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  autoridade: { label: "Autoridade", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  outro: { label: "Outro", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

const EMPTY_FORM = {
  id: undefined as string | undefined,
  nome: "",
  email: "",
  telefone: "",
  whatsapp: "",
  clube_nome: "",
  cargo: "",
  tipo: "prospeccao" as Contato["tipo"],
  estagio_funil: "novo" as Contato["estagio_funil"],
  status: "ativo" as Contato["status"],
  origem: "",
  observacoes: "",
  valor_estimado: 0,
};

function CrmContatosPage() {
  const qc = useQueryClient();
  const list = useServerFn(listCrmContatos);
  const upsert = useServerFn(upsertCrmContato);
  const del = useServerFn(deleteCrmContato);

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estagioFilter, setEstagioFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: contatos, isLoading } = useQuery({
    queryKey: ["crm-contatos"],
    queryFn: () => list({}),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: d as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Contato salvo com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["crm-contatos"] });
      qc.invalidateQueries({ queryKey: ["crm-metrics"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar contato." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Contato excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["crm-contatos"] });
      qc.invalidateQueries({ queryKey: ["crm-metrics"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." }),
  });

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setDrawer(true);
  }

  function openEdit(c: Contato) {
    setForm({
      id: c.id,
      nome: c.nome,
      email: c.email ?? "",
      telefone: c.telefone ?? "",
      whatsapp: c.whatsapp ?? "",
      clube_nome: c.clube_nome ?? "",
      cargo: c.cargo ?? "",
      tipo: c.tipo as any,
      estagio_funil: c.estagio_funil as any,
      status: c.status as any,
      origem: c.origem ?? "",
      observacoes: c.observacoes ?? "",
      valor_estimado: Number(c.valor_estimado) || 0,
    });
    setDrawer(true);
  }

  const filteredContatos = (contatos ?? []).filter((c) => {
    if (tipoFilter && c.tipo !== tipoFilter) return false;
    if (estagioFilter && c.estagio_funil !== estagioFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.nome.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.clube_nome ?? "").toLowerCase().includes(q) ||
        (c.cargo ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <GestaoHeader
        title="Contatos & Membros"
        subtitle="Cadastro unificado de membros de clubes, convidados, autoridades e parceiros institucionais do distrito."
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "CRM", to: "/gestao/crm" }, { label: "Contatos" }]}
        actions={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" /> Novo Contato
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
              placeholder="Buscar por nome, email, clube ou cargo..."
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
            {TIPO_OPTIONS.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
            ))}
          </select>
          <select
            value={estagioFilter}
            onChange={(e) => setEstagioFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary"
          >
            <option value="" className="bg-slate-900">Todas as Etapas</option>
            {ESTAGIO_OPTIONS.map((e) => (
              <option key={e.value} value={e.value} className="bg-slate-900">{e.label}</option>
            ))}
          </select>
        </div>

        {/* Contatos Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando contatos...</div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs">
              <thead className="border-b border-white/8 bg-white/[0.02] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Contato / Clube</th>
                  <th className="px-5 py-3.5 font-semibold">Tipo</th>
                  <th className="px-5 py-3.5 font-semibold">Etapa Funil</th>
                  <th className="px-5 py-3.5 font-semibold">Contato</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredContatos.map((c) => {
                  const badge = TIPO_BADGE[c.tipo] ?? TIPO_BADGE.outro;
                  const cleanPhone = (c.whatsapp || c.telefone || "").replace(/\D/g, "");

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm">{c.nome}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {c.cargo && <span className="font-medium text-slate-300">{c.cargo}</span>}
                          {c.clube_nome && <span className="text-slate-400">• {c.clube_nome}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="capitalize font-medium text-slate-300">
                          {c.estagio_funil.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span>{c.email}</span>
                            </div>
                          )}
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/55${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>{c.whatsapp || c.telefone}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Editar Contato"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(c.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Excluir Contato"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredContatos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      Nenhum contato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      {/* Drawer: Novo / Editar Contato */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? "Editar Contato" : "Novo Contato / Membro"}
        subtitle="Preencha os dados do membro, prospecção ou parceiro institucional do distrito."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate(form);
          }}
          className="space-y-4"
        >
          <Field label="Nome Completo" required>
            <FormInput
              placeholder="Ex: Dra. Camila Vasconcelos"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </Field>

          <FormRow>
            <Field label="Tipo de Contato" required>
              <FormSelect
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
              >
                {TIPO_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </FormSelect>
            </Field>
            <Field label="Etapa do Funil" required>
              <FormSelect
                value={form.estagio_funil}
                onChange={(e) => setForm({ ...form, estagio_funil: e.target.value as any })}
              >
                {ESTAGIO_OPTIONS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </FormSelect>
            </Field>
          </FormRow>

          <FormRow>
            <Field label="E-mail">
              <FormInput
                type="email"
                placeholder="contato@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp / Telefone">
              <FormInput
                placeholder="(27) 99999-8888"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value, telefone: e.target.value })}
              />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Clube de Origem / Vinculado">
              <FormInput
                placeholder="Ex: Lions Clube Vila Velha Glória"
                value={form.clube_nome}
                onChange={(e) => setForm({ ...form, clube_nome: e.target.value })}
              />
            </Field>
            <Field label="Cargo / Função">
              <FormInput
                placeholder="Ex: Presidente de Clube / Convidado"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Origem da Prospecção">
              <FormInput
                placeholder="Ex: Indicação da Governadoria"
                value={form.origem}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
              />
            </Field>
            <Field label="Cota / Valor Estimado (R$)">
              <FormInput
                type="number"
                step="0.01"
                placeholder="360.00"
                value={form.valor_estimado || ""}
                onChange={(e) => setForm({ ...form, valor_estimado: parseFloat(e.target.value) || 0 })}
              />
            </Field>
          </FormRow>

          <Field label="Observações / Anotações">
            <textarea
              rows={3}
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Anotações sobre o perfil, reuniões que participou, interesses..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </Field>

          <FormActions
            onCancel={() => setDrawer(false)}
            submitLabel={saveMut.isPending ? "Salvando..." : "Salvar Contato"}
            loading={saveMut.isPending}
          />
        </form>
      </Drawer>

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" /> Excluir Contato
            </h3>
            <p className="text-xs text-slate-300">
              Tem certeza que deseja excluir este contato e todo o seu histórico do CRM?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => delMut.mutate(confirmDelete)}
                disabled={delMut.isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {delMut.isPending ? "Excluindo..." : "Excluir Permanetemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
