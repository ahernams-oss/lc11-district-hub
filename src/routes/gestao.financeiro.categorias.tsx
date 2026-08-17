import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Tag } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormSelect, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { listCategorias, upsertCategoria, deleteCategoria } from "@/lib/financeiro.functions";

export const Route = createFileRoute("/gestao/financeiro/categorias")({
  component: CategoriasPage,
});

type Categoria = Awaited<ReturnType<typeof listCategorias>>[number];

const COLOR_PRESETS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#f97316", "#eab308", "#06b6d4", "#ec4899", "#84cc16", "#6b7280"
];

const EMPTY_FORM = {
  id: undefined as string | undefined,
  nome: "",
  tipo: "despesa" as "receita" | "despesa",
  cor: "#6366f1",
  ordem: 0,
  ativo: true,
};

function CategoriasPage() {
  const qc = useQueryClient();
  const listCats = useServerFn(listCategorias);
  const upsertCat = useServerFn(upsertCategoria);
  const delCat = useServerFn(deleteCategoria);

  const [tipoFilter, setTipoFilter] = useState<"todos" | "receita" | "despesa">("todos");
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: categorias, isLoading } = useQuery({
    queryKey: ["fin-categorias"],
    queryFn: () => listCats({}),
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) => upsertCat({ data: d }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Categoria salva com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["fin-categorias"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar categoria." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delCat({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Categoria excluída." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["fin-categorias"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." }),
  });

  function openNew(tipo?: "receita" | "despesa") {
    setForm({ ...EMPTY_FORM, tipo: tipo ?? "despesa", cor: tipo === "receita" ? "#10b981" : "#ef4444" });
    setDrawer(true);
  }

  function openEdit(c: Categoria) {
    setForm({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo as "receita" | "despesa",
      cor: c.cor,
      ordem: c.ordem,
      ativo: c.ativo,
    });
    setDrawer(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) return;
    saveMut.mutate(form);
  }

  const filteredCats = (categorias ?? []).filter((c) => {
    if (tipoFilter === "todos") return true;
    return c.tipo === tipoFilter;
  });

  const receitas = (categorias ?? []).filter((c) => c.tipo === "receita");
  const despesas = (categorias ?? []).filter((c) => c.tipo === "despesa");

  return (
    <div>
      <GestaoHeader
        title="Categorias Financeiras"
        subtitle="Gerencie o plano de categorias de receitas e despesas"
        breadcrumbs={[
          { label: "Gestão", to: "/gestao" },
          { label: "Financeiro", to: "/gestao/financeiro" },
          { label: "Categorias" }
        ]}
        actions={
          <button
            onClick={() => openNew()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nova Categoria
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2 border-b border-white/8 pb-4">
          {(["todos", "receita", "despesa"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                tipoFilter === t
                  ? "bg-primary text-white"
                  : "border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {t === "todos" ? `Todas (${(categorias ?? []).length})` : t === "receita" ? `Receitas (${receitas.length})` : `Despesas (${despesas.length})`}
            </button>
          ))}
        </div>

        {/* Categories Grid / List */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
        ) : filteredCats.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Nenhuma categoria encontrada.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCats.map((c) => (
              <div
                key={c.id}
                className="group flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full shrink-0 shadow-sm" style={{ background: c.cor }} />
                  <div>
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      {c.nome}
                      {!c.ativo && (
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">Inativo</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 capitalize flex items-center gap-2 mt-0.5">
                      <span className={c.tipo === "receita" ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                        {c.tipo}
                      </span>
                      <span>• Ordem {c.ordem}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(c.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">
              Tem certeza que deseja excluir esta categoria? Os lançamentos vinculados ficarão sem categoria.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => delMut.mutate(confirmDelete!)}
                disabled={delMut.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {delMut.isPending ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Form Drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? "Editar Categoria" : "Nova Categoria"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Nome da Categoria" required>
            <FormInput
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Doações, Material de Escritório..."
              required
            />
          </Field>

          <FormRow>
            <Field label="Tipo" required>
              <FormSelect
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as any }))}
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </FormSelect>
            </Field>
            <Field label="Ordem de Exibição">
              <FormInput
                type="number"
                value={form.ordem}
                onChange={(e) => setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
              />
            </Field>
          </FormRow>

          <Field label="Cor de Identificação">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cor}
                onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                className="h-9 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
              />
              <FormInput
                value={form.cor}
                onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))}
                placeholder="#6366f1"
                className="font-mono"
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cor: color }))}
                  className="h-6 w-6 rounded-full border border-white/20 transition transform hover:scale-110"
                  style={{ background: color }}
                />
              ))}
            </div>
          </Field>

          <Field label="Status">
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="ativo"
                checked={form.ativo}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                className="accent-primary h-4 w-4"
              />
              <label htmlFor="ativo" className="text-sm text-slate-300">Categoria ativa</label>
            </div>
          </Field>

          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
