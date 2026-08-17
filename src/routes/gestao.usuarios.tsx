import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, Shield, UserPlus, Search, Trash2, Edit3, UserCheck, Key, Building2 } from "lucide-react";
import {
  listGestaoUsers,
  updateGestaoUserRoles,
  createGestaoUser,
  deleteGestaoUser,
  type GestaoRole,
} from "@/lib/gestao-users.functions";
import { useAuth } from "@/hooks/use-auth";
import { GestaoHeader } from "@/components/gestao/GestaoHeader";
import { Drawer, Field, FormInput, FormRow, FormActions } from "@/components/gestao/GestaoForm";

export const Route = createFileRoute("/gestao/usuarios")({
  component: GestaoUsersPage,
});

const ROLES_LIST: { id: GestaoRole; label: string; desc: string; cls: string }[] = [
  { id: "gestor_admin",      label: "Gestor Admin",      desc: "Acesso total a todos os módulos e configurações de usuários", cls: "bg-primary/15 text-primary border-primary/30" },
  { id: "gestor_financeiro", label: "Gestor Financeiro", desc: "Acesso ao módulo financeiro, contas, fluxo de caixa e relatórios", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { id: "gestor_contabil",   label: "Gestor Contábil",   desc: "Acesso ao plano de contas, lançamentos e balancete", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { id: "gestor_crm",        label: "Gestor CRM",        desc: "Acesso ao CRM, membros, prospecção e pipeline de contatos", cls: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
];

function GestaoUsersPage() {
  const { user, isGestorAdmin, loading } = useAuth();

  if (loading) return <div className="p-6 text-sm text-slate-400">Carregando permissões...</div>;
  if (!isGestorAdmin) return <Navigate to="/gestao" />;

  return <UsersManager currentUser={user} />;
}

function UsersManager({ currentUser }: { currentUser: any }) {
  const qc = useQueryClient();
  const list = useServerFn(listGestaoUsers);
  const updateRoles = useServerFn(updateGestaoUserRoles);
  const createUser = useServerFn(createGestaoUser);
  const delUser = useServerFn(deleteGestaoUser);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // New User Drawer State
  const [newUserDrawer, setNewUserDrawer] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    password: "",
    nome: "",
    cargo: "",
    clube: "",
    roles: [] as GestaoRole[],
  });

  // Edit Roles Drawer State
  const [editRolesUser, setEditRolesUser] = useState<any | null>(null);
  const [editRoles, setEditRoles] = useState<GestaoRole[]>([]);

  // Delete Confirm State
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const usersQuery = useQuery({
    queryKey: ["gestao-users"],
    queryFn: () => list({}),
  });

  const createMut = useMutation({
    mutationFn: (data: typeof newUserForm) => createUser({ data }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Novo usuário criado com sucesso!" });
      setNewUserDrawer(false);
      setNewUserForm({ email: "", password: "", nome: "", cargo: "", clube: "", roles: [] });
      qc.invalidateQueries({ queryKey: ["gestao-users"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao criar usuário." }),
  });

  const updateRolesMut = useMutation({
    mutationFn: (vars: { userId: string; roles: GestaoRole[] }) => updateRoles({ data: vars }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Permissões de acesso atualizadas com sucesso." });
      setEditRolesUser(null);
      qc.invalidateQueries({ queryKey: ["gestao-users"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao atualizar permissões." }),
  });

  const deleteMut = useMutation({
    mutationFn: (userId: string) => delUser({ data: { userId } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Usuário removido da gestão." });
      setConfirmDelete(null);
      qc.invalidateQueries({ queryKey: ["gestao-users"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro ao excluir usuário." }),
  });

  function openEditRoles(userItem: any) {
    setEditRolesUser(userItem);
    setEditRoles(userItem.gestao_roles ?? []);
  }

  function toggleRoleInNewForm(roleId: GestaoRole) {
    setNewUserForm((f) => ({
      ...f,
      roles: f.roles.includes(roleId) ? f.roles.filter((r) => r !== roleId) : [...f.roles, roleId],
    }));
  }

  function toggleRoleInEditForm(roleId: GestaoRole) {
    setEditRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  }

  const filteredUsers = (usersQuery.data ?? []).filter((u) => {
    if (roleFilter && !u.gestao_roles.includes(roleFilter as any)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.email ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <GestaoHeader
        title="Usuários e Perfis de Acesso"
        subtitle="Gerenciamento descentralizado de perfis (Financeiro, Contábil, CRM e Admin) para o Sistema de Gestão Distrital."
        breadcrumbs={[
          { label: "Gestão", to: "/gestao" },
          { label: "Configurações" },
          { label: "Usuários" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => usersQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </button>
            <button
              onClick={() => setNewUserDrawer(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <UserPlus className="h-4 w-4" /> Novo Usuário
            </button>
          </div>
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
              placeholder="Buscar por e-mail do usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-primary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary"
          >
            <option value="" className="bg-slate-900">Todos os Perfis</option>
            <option value="gestor_admin" className="bg-slate-900">Gestor Admin</option>
            <option value="gestor_financeiro" className="bg-slate-900">Gestor Financeiro</option>
            <option value="gestor_contabil" className="bg-slate-900">Gestor Contábil</option>
            <option value="gestor_crm" className="bg-slate-900">Gestor CRM</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden shadow-xl">
          {usersQuery.isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Carregando usuários da gestão...</div>
          ) : usersQuery.isError ? (
            <div className="p-8 text-center text-sm text-red-400">
              Erro ao carregar usuários: {(usersQuery.error as Error)?.message}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/8 bg-white/[0.02] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Usuário / E-mail</th>
                  <th className="px-5 py-3.5 font-semibold">Data Cadastro</th>
                  <th className="px-5 py-3.5 font-semibold">Último Acesso</th>
                  <th className="px-5 py-3.5 font-semibold">Módulos Permitidos</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const hasRoles = u.gestao_roles.length > 0;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs uppercase">
                            {(u.email ?? "U")[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {u.email ?? "—"}
                              {isSelf && (
                                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary font-normal">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">ID: {u.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {u.last_sign_in_at
                          ? new Date(u.last_sign_in_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                          : "Nunca acessou"}
                      </td>
                      <td className="px-5 py-4">
                        {hasRoles ? (
                          <div className="flex flex-wrap gap-1.5">
                            {u.gestao_roles.map((rId: GestaoRole) => {
                              const item = ROLES_LIST.find((r) => r.id === rId);
                              return (
                                <span
                                  key={rId}
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${item?.cls ?? "bg-white/10 text-white"}`}
                                >
                                  <Shield className="h-2.5 w-2.5" />
                                  {item?.label ?? rId}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                            Sem acesso à gestão
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditRoles(u)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Gerenciar Permissões"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="rounded-lg border border-red-500/20 bg-red-500/5 p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Remover Usuário"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer: Novo Usuário */}
      <Drawer
        open={newUserDrawer}
        onClose={() => setNewUserDrawer(false)}
        title="Novo Usuário da Gestão"
        subtitle="Cadastre um novo usuário com acesso direto aos módulos administrativos do Distrito."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMut.mutate(newUserForm);
          }}
          className="space-y-4"
        >
          <Field label="E-mail de Acesso" required>
            <FormInput
              type="email"
              placeholder="usuario@distritolc11.org.br"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              required
            />
          </Field>

          <Field label="Senha Inicial" required hint="Mínimo 6 caracteres">
            <FormInput
              type="password"
              placeholder="••••••••"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              required
            />
          </Field>

          <FormRow>
            <Field label="Nome Completo">
              <FormInput
                placeholder="Ex: Leão João Silva"
                value={newUserForm.nome}
                onChange={(e) => setNewUserForm({ ...newUserForm, nome: e.target.value })}
              />
            </Field>
            <Field label="Cargo / Função">
              <FormInput
                placeholder="Ex: Tesoureiro Distrital"
                value={newUserForm.cargo}
                onChange={(e) => setNewUserForm({ ...newUserForm, cargo: e.target.value })}
              />
            </Field>
          </FormRow>

          <Field label="Clube de Origem">
            <FormInput
              placeholder="Ex: Lions Clube Vitória Centro"
              value={newUserForm.clube}
              onChange={(e) => setNewUserForm({ ...newUserForm, clube: e.target.value })}
            />
          </Field>

          <div className="pt-2 border-t border-white/10">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Selecione os Perfis de Acesso Permitidos:
            </label>
            <div className="space-y-2">
              {ROLES_LIST.map((role) => {
                const checked = newUserForm.roles.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                      checked ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoleInNewForm(role.id)}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">{role.label}</div>
                      <div className="text-[11px] text-slate-400">{role.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <FormActions
            onCancel={() => setNewUserDrawer(false)}
            submitLabel={createMut.isPending ? "Cadastrando..." : "Cadastrar Usuário"}
            loading={createMut.isPending}
          />
        </form>
      </Drawer>

      {/* Drawer: Editar Permissões */}
      <Drawer
        open={!!editRolesUser}
        onClose={() => setEditRolesUser(null)}
        title="Gerenciar Permissões de Acesso"
        subtitle={`Defina os módulos que ${editRolesUser?.email ?? "o usuário"} terá permissão para acessar.`}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs font-semibold text-white">{editRolesUser?.email}</div>
              <div className="text-[11px] text-slate-400">ID: {editRolesUser?.id}</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {ROLES_LIST.map((role) => {
              const checked = editRoles.includes(role.id);
              return (
                <label
                  key={role.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    checked ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRoleInEditForm(role.id)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900 text-primary focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">{role.label}</div>
                    <div className="text-[11px] text-slate-400">{role.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <FormActions
            onCancel={() => setEditRolesUser(null)}
            onSubmit={() => updateRolesMut.mutate({ userId: editRolesUser.id, roles: editRoles })}
            submitLabel={updateRolesMut.isPending ? "Salvando..." : "Salvar Permissões"}
            loading={updateRolesMut.isPending}
          />
        </div>
      </Drawer>

      {/* Modal: Confirmar Exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" /> Confirmar Exclusão de Usuário
            </h3>
            <p className="text-xs text-slate-300">
              Tem certeza que deseja excluir o acesso de <strong className="text-white">{confirmDelete.email}</strong> do Sistema de Gestão? Esta ação revogará todo o acesso permanentemente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMut.mutate(confirmDelete.id)}
                disabled={deleteMut.isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMut.isPending ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

