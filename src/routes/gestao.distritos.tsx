import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Globe2, Lock } from "lucide-react";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormRow, FormActions } from "@/components/gestao/GestaoForm";
import { useAuth } from "@/hooks/use-auth";
import {
  listDistritos,
  upsertDistrito,
  deleteDistrito,
  listDistritoUsuarios,
  setDistritosDoUsuario,
} from "@/lib/distritos.functions";

export const Route = createFileRoute("/gestao/distritos")({
  component: DistritosPage,
});

const EMPTY = {
  id: undefined as string | undefined,
  nome: "",
  sigla: "",
  estados: "",
  ordem: 0,
  ativo: true,
};

function DistritosPage() {
  const qc = useQueryClient();
  const { isGestorAdmin, isAdmin } = useAuth();
  const master = isGestorAdmin || isAdmin;

  const fetchDistritos = useServerFn(listDistritos);
  const fetchUsuarios = useServerFn(listDistritoUsuarios);
  const salvar = useServerFn(upsertDistrito);
  const excluir = useServerFn(deleteDistrito);
  const salvarVinculos = useServerFn(setDistritosDoUsuario);

  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["distritos"],
    queryFn: () => fetchDistritos({}),
  });

  const { data: usuarios } = useQuery({
    queryKey: ["distritos-usuarios"],
    queryFn: () => fetchUsuarios({}),
    enabled: master,
  });

  const saveMut = useMutation({
    mutationFn: (d: typeof form) =>
      salvar({ data: { ...d, estados: d.estados?.trim() ? d.estados.trim() : null } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Distrito salvo com sucesso." });
      setDrawer(false);
      qc.invalidateQueries({ queryKey: ["distritos"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar distrito." }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Distrito excluído." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["distritos"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir." }),
  });

  const vinculoMut = useMutation({
    mutationFn: (v: { user_id: string; distrito_ids: string[] }) => salvarVinculos({ data: v }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Acessos atualizados." });
      qc.invalidateQueries({ queryKey: ["distritos-usuarios"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao salvar acessos." }),
  });

  if (!master) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 font-display text-lg font-bold text-white">Sem permissão</h2>
          <p className="mt-2 text-sm text-slate-400">
            Apenas Gestores Administradores podem gerenciar distritos.
          </p>
        </div>
      </div>
    );
  }

  const distritos = data?.distritos ?? [];

  function toggleVinculo(userId: string, distritoId: string, atuais: string[]) {
    const next = atuais.includes(distritoId)
      ? atuais.filter((d) => d !== distritoId)
      : [...atuais, distritoId];
    vinculoMut.mutate({ user_id: userId, distrito_ids: next });
  }

  return (
    <div>
      <GestaoHeader
        title="Distritos"
        subtitle="Cadastre os distritos e defina quais gestores acessam cada um"
        breadcrumbs={[{ label: "Gestão", to: "/gestao" }, { label: "Distritos" }]}
        actions={
          <button
            onClick={() => {
              setForm({ ...EMPTY });
              setDrawer(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Novo Distrito
          </button>
        }
      />

      <div className="space-y-8 p-6">
        {msg && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100">
              ×
            </button>
          </div>
        )}

        {/* Lista de distritos */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Carregando...</div>
        ) : distritos.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">Nenhum distrito cadastrado.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {distritos.map((d) => (
              <div
                key={d.id}
                className="group flex items-start justify-between rounded-xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/20"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Globe2 className="h-4 w-4 text-primary" />
                    {d.sigla}
                    {!d.ativo && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-400">{d.nome}</div>
                  {d.estados && (
                    <div className="mt-0.5 text-[11px] text-slate-500">{d.estados}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setForm({
                        id: d.id,
                        nome: d.nome,
                        sigla: d.sigla,
                        estados: d.estados ?? "",
                        ordem: d.ordem,
                        ativo: d.ativo,
                      });
                      setDrawer(true);
                    }}
                    className="rounded p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(d.id)}
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

        {/* Acessos por distrito */}
        <div>
          <h2 className="font-display text-base font-bold text-white">Acesso por distrito</h2>
          <p className="mt-1 text-xs text-slate-500">
            Marque os distritos que cada gestor pode visualizar. Gestores Administradores enxergam
            todos os distritos.
          </p>

          <div className="mt-4 overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/[0.03] text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Conta</th>
                  {distritos.map((d) => (
                    <th key={d.id} className="px-4 py-3 text-center font-semibold">
                      {d.sigla}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(usuarios ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="text-slate-200">{u.email}</div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        {u.isMaster ? "Acesso total" : u.roles.join(", ")}
                      </div>
                    </td>
                    {distritos.map((d) => (
                      <td key={d.id} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          disabled={u.isMaster || vinculoMut.isPending}
                          checked={u.isMaster || u.distritos.includes(d.id)}
                          onChange={() => toggleVinculo(u.id, d.id, u.distritos)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {(usuarios ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={distritos.length + 1}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Nenhum gestor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setConfirmDelete(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0d1321] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Confirmar exclusão</h3>
            <p className="mt-2 text-sm text-slate-400">
              Excluir o distrito não apaga os registros já cadastrados, mas eles ficarão sem
              distrito. Deseja continuar?
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

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title={form.id ? "Editar Distrito" : "Novo Distrito"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.nome || !form.sigla) return;
            saveMut.mutate(form);
          }}
          className="space-y-5"
        >
          <Field label="Sigla" required>
            <FormInput
              value={form.sigla}
              onChange={(e) => setForm((f) => ({ ...f, sigla: e.target.value }))}
              placeholder="Ex: LC-11"
              required
            />
          </Field>
          <Field label="Nome do Distrito" required>
            <FormInput
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Distrito LC-11"
              required
            />
          </Field>
          <FormRow>
            <Field label="Estados / Abrangência">
              <FormInput
                value={form.estados}
                onChange={(e) => setForm((f) => ({ ...f, estados: e.target.value }))}
                placeholder="Ex: RJ, ES"
              />
            </Field>
            <Field label="Ordem de Exibição">
              <FormInput
                type="number"
                value={form.ordem}
                onChange={(e) => setForm((f) => ({ ...f, ordem: parseInt(e.target.value) || 0 }))}
              />
            </Field>
          </FormRow>
          <Field label="Status">
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="distrito-ativo"
                checked={form.ativo}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <label htmlFor="distrito-ativo" className="text-sm text-slate-300">
                Distrito ativo
              </label>
            </div>
          </Field>
          <FormActions onCancel={() => setDrawer(false)} loading={saveMut.isPending} />
        </form>
      </Drawer>
    </div>
  );
}
