import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, RefreshCw, CheckCircle2, XCircle, Eye } from "lucide-react";
import {
  listAuthUsers,
  setUserRole,
  deleteAuthUser,
  type PanelRole,
} from "@/lib/admin-users.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/usuarios")({
  ssr: false,
  head: () => ({ meta: [{ title: "Usuários — Painel Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

const ROLE_OPTIONS: { value: PanelRole | "none"; label: string }[] = [
  { value: "none", label: "Sem acesso (pendente)" },
  { value: "basico", label: "Básico — apenas visualizar" },
  { value: "intermediario", label: "Intermediário — editar conteúdo" },
  { value: "avancado", label: "Avançado — editar + ver usuários" },
  { value: "admin", label: "Administrador — controle total" },
];

const ROLE_BADGE: Record<PanelRole, { label: string; cls: string }> = {
  admin: { label: "Administrador", cls: "bg-primary text-primary-foreground" },
  avancado: { label: "Avançado", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  intermediario: { label: "Intermediário", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  basico: { label: "Básico", cls: "bg-muted text-muted-foreground" },
};

function AdminUsersPage() {
  const { user, canViewUsers, canManageUsers } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listAuthUsers);
  const setRole = useServerFn(setUserRole);
  const delUser = useServerFn(deleteAuthUser);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  if (!canViewUsers) {
    return <Navigate to="/admin" />;
  }

  return <UsersTable user={user} canManageUsers={canManageUsers} />;
}

function UsersTable({ user, canManageUsers }: { user: any; canManageUsers: boolean }) {
  const qc = useQueryClient();
  const list = useServerFn(listAuthUsers);
  const setRole = useServerFn(setUserRole);
  const delUser = useServerFn(deleteAuthUser);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-auth-users"],
    queryFn: () => list({}),
  });

  const roleMut = useMutation({
    mutationFn: (vars: { userId: string; role: PanelRole | "none" }) =>
      setRole({ data: vars }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Perfil atualizado." });
      qc.invalidateQueries({ queryKey: ["admin-auth-users"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  const delMut = useMutation({
    mutationFn: (userId: string) => delUser({ data: { userId } }),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Usuário excluído." });
      qc.invalidateQueries({ queryKey: ["admin-auth-users"] });
    },
    onError: (e: any) => setMsg({ type: "err", text: e?.message ?? "Erro" }),
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Usuários & Acessos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {canManageUsers
              ? "Aprove o acesso ao painel e defina o perfil de cada usuário. Qualquer pessoa pode se cadastrar em /auth, mas só verá o painel após receber um perfil aqui."
              : "Você tem perfil Avançado: pode visualizar os usuários cadastrados, mas não pode aprovar, alterar ou excluir. Peça a um administrador caso precise."}
          </p>
        </div>
        <button
          onClick={() => usersQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface"
        >
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      {!canManageUsers && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
          <Eye className="h-4 w-4" /> Modo apenas leitura
        </div>
      )}

      {msg && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
            msg.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {msg.text}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-card">
        {usersQuery.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando usuários...</div>
        ) : usersQuery.isError ? (
          <div className="p-6 text-sm text-destructive">
            Erro: {(usersQuery.error as Error)?.message}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Último acesso</th>
                <th className="px-4 py-3">Perfil atual</th>
                {canManageUsers && <th className="px-4 py-3">Alterar perfil</th>}
                {canManageUsers && <th className="px-4 py-3 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {(usersQuery.data ?? []).map((u) => {
                const isSelf = user?.id === u.id;
                const busy =
                  (roleMut.isPending && roleMut.variables?.userId === u.id) ||
                  (delMut.isPending && delMut.variables === u.id);
                const currentRole = (u.highest_role ?? null) as PanelRole | null;
                const badge = currentRole ? ROLE_BADGE[currentRole] : null;
                return (
                  <tr key={u.id} className="border-t align-middle">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{u.email ?? "—"}</div>
                      {isSelf && (
                        <div className="text-xs text-muted-foreground">(você)</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {badge ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Pendente
                        </span>
                      )}
                    </td>
                    {canManageUsers && (
                      <td className="px-4 py-3">
                        <select
                          disabled={busy}
                          value={currentRole ?? "none"}
                          onChange={(e) =>
                            roleMut.mutate({
                              userId: u.id,
                              role: e.target.value as PanelRole | "none",
                            })
                          }
                          className="rounded-md border bg-background px-2 py-1 text-xs disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              disabled={isSelf && opt.value !== "admin"}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {canManageUsers && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={busy || isSelf}
                            onClick={() => {
                              if (confirm(`Excluir usuário ${u.email}? Esta ação não pode ser desfeita.`)) {
                                delMut.mutate(u.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                            title={isSelf ? "Você não pode excluir sua própria conta" : "Excluir usuário"}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {(usersQuery.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={canManageUsers ? 6 : 4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
