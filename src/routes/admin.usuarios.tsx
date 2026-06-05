import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shield, ShieldOff, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import {
  listAuthUsers,
  setUserAdmin,
  deleteAuthUser,
} from "@/lib/admin-users.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/usuarios")({
  ssr: false,
  head: () => ({ meta: [{ title: "Usuários — Painel Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listAuthUsers);
  const setRole = useServerFn(setUserAdmin);
  const delUser = useServerFn(deleteAuthUser);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-auth-users"],
    queryFn: () => list({}),
  });

  const roleMut = useMutation({
    mutationFn: (vars: { userId: string; isAdmin: boolean }) =>
      setRole({ data: vars }),
    onSuccess: (_d, vars) => {
      setMsg({
        type: "ok",
        text: vars.isAdmin ? "Acesso de admin concedido." : "Acesso de admin revogado.",
      });
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
            Aprove o acesso ao painel concedendo a função <strong>administrador</strong> a quem já se cadastrou.
            Qualquer pessoa pode criar uma conta em <code>/auth</code>, mas só verá o painel após ser aprovada aqui.
          </p>
        </div>
        <button
          onClick={() => usersQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-surface"
        >
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

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
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(usersQuery.data ?? []).map((u) => {
                const isSelf = user?.id === u.id;
                const busy =
                  (roleMut.isPending && roleMut.variables?.userId === u.id) ||
                  (delMut.isPending && delMut.variables === u.id);
                return (
                  <tr key={u.id} className="border-t">
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
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          <Shield className="h-3 w-3" /> Aprovado (admin)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.is_admin ? (
                          <button
                            disabled={busy || isSelf}
                            onClick={() =>
                              roleMut.mutate({ userId: u.id, isAdmin: false })
                            }
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-surface disabled:opacity-50"
                            title={isSelf ? "Você não pode revogar seu próprio acesso" : "Revogar acesso"}
                          >
                            <ShieldOff className="h-3 w-3" /> Revogar
                          </button>
                        ) : (
                          <button
                            disabled={busy}
                            onClick={() =>
                              roleMut.mutate({ userId: u.id, isAdmin: true })
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          >
                            <Shield className="h-3 w-3" /> Aprovar
                          </button>
                        )}
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
                  </tr>
                );
              })}
              {(usersQuery.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
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
