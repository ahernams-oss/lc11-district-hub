import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Tag, Paperclip } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { StatusBadge } from "@/components/gestao/StatusBadge";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { CurrencyInput } from "@/components/gestao/CurrencyInput";
import { FileUploadInput } from "@/components/gestao/FileUploadInput";
import { listContasReceber, upsertContaReceber, deleteContaReceber, listCategorias, listContasBancarias } from "@/lib/financeiro.functions";
import { formatBRL, formatDate, currentYearMonth } from "@/lib/financeiro.utils";

export const Route = createFileRoute("/gestao/financeiro/contas-receber")({
  component: ContasReceberPage,
});

type Conta = Awaited<ReturnType<typeof listContasReceber>>[number];

const STATUS_OPTIONS = ["pendente", "recebido", "vencido", "cancelado"] as const;
const EMPTY_FORM = {
  id: undefined as string | undefined,
  descricao: "",
  categoria_id: "" as string | undefined,
  conta_id: "" as string | undefined,
  valor: 0,
  vencimento: "",
  competencia: "" as string | undefined,
  status: "pendente" as const,
  recebido_em: "" as string | undefined,
  valor_recebido: 0,
  pagador: "",
  documento: "",
  anexo_url: "" as string | undefined,
  observacoes: "",
};

function ContasReceberPage() {
  const qc = useQueryClient();
  const list = useServerFn(listContasReceber);
  const upsert = useServerFn(upsertContaReceber);
  const del = useServerFn(deleteContaReceber);
  const listCats = useServerFn(listCategorias);
  const listContas = useServerFn(listContasBancarias);

  const [mes, setMes] = useState(currentYearMonth());
  const [statusFilter, setStatusFilter] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: contas, isLoading } = useQuery({
    queryKey: ["contas-receber", mes, statusFilter],
    queryFn: () => list({ data: { mes, status: statusFilter || undefined } }),
  });

  const { data: categorias } = useQuery({ queryKey: ["fin-categorias"], queryFn: () => listCats({}) });
  const { data: bancarias } = useQuery({ queryKey: ["fin-bancarias"], queryFn: () => listContas({}) });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsert({ data: {
      ...d,
      categoria_id: d.categoria_id || null,
      conta_id: d.conta_id || null,
      competencia: d.competencia || null,
      recebido_em: d.recebido_em || null,
      valor_recebido: d.valor_recebido || null,
      pagador: d.pagador || null,
      documento: d.documento || null,
      anexo_url: d.anexo_url || null,
      observacoes: d.observacoes || null,
    } as any }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Registro salvo com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["contas-receber"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Registro excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["contas-receber"] });
      qc.invalidateQueries({ queryKey: ["financeiro-dashboard"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  function openEdit(c: Conta) {
    setForm({
      id: c.id,
      descricao: c.descricao,
      categoria_id: (c as any).categoria_id ?? "",
      conta_id: (c as any).conta_id ?? "",
      valor: c.valor,
      vencimento: c.vencimento,
      competencia: (c as any).competencia ?? "",
      status: c.status as any,
      recebido_em: (c as any).recebido_em ?? "",
      valor_recebido: (c as any).valor_recebido ?? 0,
      pagador: (c as any).pagador ?? "",
      documento: (c as any).documento ?? "",
      anexo_url: (c as any).anexo_url ?? "",
      observacoes: (c as any).observacoes ?? "",
    });
    setDrawer(true);
  }

  const catsReceita = (categorias ?? []).filter((c: any) => c.tipo === "receita");
  const total = (contas ?? []).reduce((s, c) => s + c.valor, 0);
  const recebido = (contas ?? []).filter((c) => c.status === "recebido").reduce((s, c) => s + ((c as any).valor_recebido ?? c.valor), 0);
  const pendente = (contas ?? []).filter((c) => c.status === "pendente").reduce((s, c) => s + c.valor, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMut.mutate(form);
  }

  return (
    <div>
      <GestaoHeader
        title="Contas a Receber"
        subtitle="Receitas previstas e realizadas do distrito"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Contas a Receber" }]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/gestao/financeiro/categorias"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Tag className="h-3.5 w-3.5" /> Gerenciar Categorias
            </Link>
            <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Nova Receita
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto">×</button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total previsto</div>
            <div className="mt-1 text-xl font-bold text-white">{formatBRL(total)}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Recebido</div>
            <div className="mt-1 text-xl font-bold text-emerald-400">{formatBRL(recebido)}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">A receber</div>
            <div className="mt-1 text-xl font-bold text-amber-400">{formatBRL(pendente)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2 text-sm text-white outline-none focus:border-primary">
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : (contas ?? []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhuma receita encontrada.{" "}
              <button onClick={() => { setForm({ ...EMPTY_FORM }); setDrawer(true); }} className="text-primary underline">Cadastrar agora</button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[760px] w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Anexo</th>
                  <th className="px-4 py-3 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(contas ?? []).map((c) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{c.descricao}</div>
                      {(c as any).pagador && <div className="text-xs text-slate-500">{(c as any).pagador}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {(c as any).categoria ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-300">
                          <span className="h-2 w-2 rounded-full" style={{ background: (c as any).categoria.cor }} />
                          {(c as any).categoria.nome}
                        </span>
                      ) : <span className="text-xs text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatDate(c.vencimento)}</td>
                    <td className="px-4 py-3 text-right font-mono text-white">{formatBRL(c.valor)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-center">
                      {(c as any).anexo_url ? (
                        <a
                          href={(c as any).anexo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
                          title="Ver comprovante"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>Ver</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">Tem certeza? Esta ação não pode ser desfeita.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">Cancelar</button>
              <button onClick={() => delMut.mutate(confirmDelete!)} disabled={delMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                {delMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Receita" : "Nova Receita"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Descrição" required>
            <FormInput value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Cota mensal clube X..." required />
          </Field>

          <FormRow>
            <Field label="Categoria">
              <div className="flex gap-2">
                <FormSelect
                  value={form.categoria_id ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value || undefined }))}
                  className="flex-1"
                >
                  <option value="">Sem categoria</option>
                  {catsReceita.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </FormSelect>
                <Link
                  to="/gestao/financeiro/categorias"
                  target="_blank"
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 px-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  title="Gerenciar categorias"
                >
                  <Tag className="h-4 w-4" />
                </Link>
              </div>
            </Field>
            <Field label="Conta Bancária">
              <FormSelect value={form.conta_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, conta_id: e.target.value || undefined }))}>
                <option value="">Não especificada</option>
                {(bancarias ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </FormSelect>
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Valor" required>
              <CurrencyInput value={form.valor} onChange={(v) => setForm((f) => ({ ...f, valor: v }))} />
            </Field>
            <Field label="Vencimento" required>
              <FormInput type="date" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} required />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Status">
              <FormSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </FormSelect>
            </Field>
            <Field label="Competência">
              <FormInput type="month" value={form.competencia ?? ""} onChange={(e) => setForm((f) => ({ ...f, competencia: e.target.value || undefined }))} />
            </Field>
          </FormRow>

          {(form.status as string) === "recebido" && (
            <FormRow>
              <Field label="Recebido em">
                <FormInput type="date" value={form.recebido_em ?? ""} onChange={(e) => setForm((f) => ({ ...f, recebido_em: e.target.value }))} />
              </Field>
              <Field label="Valor recebido">
                <CurrencyInput value={form.valor_recebido ?? 0} onChange={(v) => setForm((f) => ({ ...f, valor_recebido: v }))} />
              </Field>
            </FormRow>
          )}

          <Field label="Pagador / Origem">
            <FormInput value={form.pagador ?? ""} onChange={(e) => setForm((f) => ({ ...f, pagador: e.target.value }))} placeholder="Nome do pagador" />
          </Field>

          <Field label="Anexo / Comprovante">
            <FileUploadInput
              value={form.anexo_url}
              onChange={(url) => setForm((f) => ({ ...f, anexo_url: url || undefined }))}
              folder="comprovantes_receber"
            />
          </Field>

          <Field label="Observações">
            <FormTextarea value={form.observacoes ?? ""} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
          </Field>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}

