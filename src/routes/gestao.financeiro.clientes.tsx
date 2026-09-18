import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Search, Users } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormTextarea, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { listClientes, upsertCliente, deleteCliente } from "@/lib/clientes.functions";
import { listCategorias } from "@/lib/financeiro.functions";

export const Route = createFileRoute("/gestao/financeiro/clientes")({
  component: ClientesPage,
});

const EMPTY = {
  id: undefined as string | undefined,
  nome: "",
  nome_fantasia: "",
  tipo_pessoa: "juridica" as "juridica" | "fisica",
  documento: "",
  email: "",
  telefone: "",
  whatsapp: "",
  contato_nome: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado_uf: "",
  categoria_id: "",
  clube_nome: "",
  observacoes: "",
  ativo: true,
};

function ClientesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listClientes);
  const save = useServerFn(upsertCliente);
  const del = useServerFn(deleteCliente);
  const listCats = useServerFn(listCategorias);

  const [busca, setBusca] = useState("");
  const [debounced, setDebounced] = useState("");
  const [somenteAtivos, setSomenteAtivos] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(busca), 250);
    return () => clearTimeout(t);
  }, [busca]);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["clientes", debounced, somenteAtivos],
    queryFn: () => list({ data: { busca: debounced || undefined, apenasAtivos: somenteAtivos || undefined } }),
  });

  const { data: categorias } = useQuery({ queryKey: ["fin-categorias"], queryFn: () => listCats({}) });
  const catsReceita = (categorias ?? []).filter((c: any) => c.tipo === "receita");

  const saveMut = useMutation({
    mutationFn: (d: typeof form) =>
      save({ data: {
        ...d,
        nome_fantasia: d.nome_fantasia || null,
        documento: d.documento || null,
        email: d.email || null,
        telefone: d.telefone || null,
        whatsapp: d.whatsapp || null,
        contato_nome: d.contato_nome || null,
        cep: d.cep || null,
        logradouro: d.logradouro || null,
        numero: d.numero || null,
        complemento: d.complemento || null,
        bairro: d.bairro || null,
        cidade: d.cidade || null,
        estado_uf: d.estado_uf || null,
        categoria_id: d.categoria_id || null,
        clube_nome: d.clube_nome || null,
        observacoes: d.observacoes || null,
      } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Cliente salvo com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["clientes-busca"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Cliente excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["clientes"] });
      qc.invalidateQueries({ queryKey: ["clientes-busca"] });
    },
    onError: (e: any) => {
      setConfirmDelete(null);
      setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." });
    },
  });

  function openNew() {
    setForm({ ...EMPTY });
    setDrawer(true);
  }

  function openEdit(c: any) {
    setForm({
      id: c.id,
      nome: c.nome ?? "",
      nome_fantasia: c.nome_fantasia ?? "",
      tipo_pessoa: (c.tipo_pessoa ?? "juridica") as "juridica" | "fisica",
      documento: c.documento ?? "",
      email: c.email ?? "",
      telefone: c.telefone ?? "",
      whatsapp: c.whatsapp ?? "",
      contato_nome: c.contato_nome ?? "",
      cep: c.cep ?? "",
      logradouro: c.logradouro ?? "",
      numero: c.numero ?? "",
      complemento: c.complemento ?? "",
      bairro: c.bairro ?? "",
      cidade: c.cidade ?? "",
      estado_uf: c.estado_uf ?? "",
      categoria_id: c.categoria_id ?? "",
      clube_nome: c.clube_nome ?? "",
      observacoes: c.observacoes ?? "",
      ativo: c.ativo ?? true,
    });
    setDrawer(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    saveMut.mutate(form);
  }

  return (
    <div>
      <GestaoHeader
        title="Cadastro de Clientes"
        subtitle="Clientes e pagadores usados nas contas a receber"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Financeiro", to: "/gestao/financeiro" }, { label: "Clientes" }]}
        actions={
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Novo Cliente
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-primary">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, nome fantasia, CNPJ/CPF, clube ou cidade..."
              className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={somenteAtivos} onChange={(e) => setSomenteAtivos(e.target.checked)} />
            Somente ativos
          </label>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
          ) : (rows ?? []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Nenhum cliente encontrado. <button onClick={openNew} className="text-primary underline">Cadastrar agora</button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto"><table className="min-w-[820px] w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.02] text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">CNPJ / CPF</th>
                  <th className="px-4 py-3">Clube</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Cidade / UF</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3 w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((c: any) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <div>
                          <div className="font-medium text-white">{c.nome}</div>
                          {c.nome_fantasia && <div className="text-xs text-slate-500">{c.nome_fantasia}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{c.documento || "—"}</td>
                    <td className="px-4 py-3 text-slate-300">{c.clube_nome || "—"}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{c.contato_nome || "—"}</div>
                      <div className="text-xs text-slate-500">{c.telefone || c.whatsapp || c.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{[c.cidade, c.estado_uf].filter(Boolean).join(" / ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${c.ativo ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                        {c.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(c)} className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(c.id)} className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">Tem certeza que deseja excluir este cliente? Se houver contas vinculadas, prefira desativá-lo.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Cancelar</button>
              <button onClick={() => delMut.mutate(confirmDelete!)} disabled={delMut.isPending} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
                {delMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title={form.id ? "Editar Cliente" : "Novo Cliente"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Razão social / Nome" required>
            <FormInput value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required placeholder="Nome do cliente ou pagador" />
          </Field>

          <FormRow>
            <Field label="Nome fantasia">
              <FormInput value={form.nome_fantasia} onChange={(e) => setForm((f) => ({ ...f, nome_fantasia: e.target.value }))} />
            </Field>
            <Field label="Tipo">
              <FormSelect value={form.tipo_pessoa} onChange={(e) => setForm((f) => ({ ...f, tipo_pessoa: e.target.value as any }))}>
                <option value="juridica">Pessoa jurídica</option>
                <option value="fisica">Pessoa física</option>
              </FormSelect>
            </Field>
          </FormRow>

          <FormRow>
            <Field label={form.tipo_pessoa === "fisica" ? "CPF" : "CNPJ"}>
              <FormInput value={form.documento} onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))} />
            </Field>
            <Field label="Categoria padrão de receita">
              <FormSelect value={form.categoria_id} onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}>
                <option value="">Sem categoria</option>
                {catsReceita.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </FormSelect>
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Clube vinculado">
              <FormInput value={form.clube_nome} onChange={(e) => setForm((f) => ({ ...f, clube_nome: e.target.value }))} placeholder="Ex: LC Vitória Centro" />
            </Field>
            <Field label="Pessoa de contato">
              <FormInput value={form.contato_nome} onChange={(e) => setForm((f) => ({ ...f, contato_nome: e.target.value }))} />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="E-mail">
              <FormInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Telefone">
              <FormInput value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="WhatsApp">
              <FormInput value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
            </Field>
            <Field label="CEP">
              <FormInput value={form.cep} onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))} />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Logradouro">
              <FormInput value={form.logradouro} onChange={(e) => setForm((f) => ({ ...f, logradouro: e.target.value }))} />
            </Field>
            <Field label="Número">
              <FormInput value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Complemento">
              <FormInput value={form.complemento} onChange={(e) => setForm((f) => ({ ...f, complemento: e.target.value }))} />
            </Field>
            <Field label="Bairro">
              <FormInput value={form.bairro} onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))} />
            </Field>
          </FormRow>

          <FormRow>
            <Field label="Cidade">
              <FormInput value={form.cidade} onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))} />
            </Field>
            <Field label="UF">
              <FormInput value={form.estado_uf} onChange={(e) => setForm((f) => ({ ...f, estado_uf: e.target.value.toUpperCase().slice(0, 2) }))} />
            </Field>
          </FormRow>

          <Field label="Observações">
            <FormTextarea value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} />
            Cliente ativo
          </label>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
