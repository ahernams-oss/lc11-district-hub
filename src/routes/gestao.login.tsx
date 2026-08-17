import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Building2, Lock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/gestao/login")({
  head: () => ({
    meta: [
      { title: "Sistema de Gestão — Distrito LC-11" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GestaoLoginPage,
});

function GestaoLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading, hasGestaoAccess } = useAuth();

  useEffect(() => {
    if (!loading && user && hasGestaoAccess) {
      navigate({ to: "/gestao" });
    }
  }, [user, loading, hasGestaoAccess, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? "Erro ao autenticar");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1629]">
        <div className="text-sm text-slate-400">Carregando...</div>
      </div>
    );
  }

  // User is logged in but doesn't have gestão access
  if (user && !hasGestaoAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1629] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-white">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sua conta (<strong className="text-slate-300">{user.email}</strong>) não possui permissão para o Sistema de Gestão.
            Solicite acesso a um Gestor Administrador.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Sair e tentar outra conta
            </button>
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-300">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1629] px-4">
      {/* Background gradient accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute -bottom-1/4 right-0 h-[400px] w-[400px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep shadow-lg shadow-primary/20">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">
            Sistema de Gestão
          </h1>
          <p className="mt-1 text-sm text-slate-400">Distrito LC-11</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <h2 className="font-display text-lg font-semibold text-white">Entrar</h2>
          <p className="mt-1 text-sm text-slate-400">
            Acesso restrito aos gestores financeiros, contábeis e de CRM do distrito.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Dev bypass */}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("dev_gestao_bypass", "true");
                  window.location.href = "/gestao";
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                🔑 Entrar como Gestor Admin (Modo Dev)
              </button>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-gradient-to-r from-primary to-primary-deep px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 disabled:opacity-60"
            >
              {busy ? "Autenticando..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-300">
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            Voltar ao site
          </Link>
          <Link to="/auth" className="hover:text-slate-300">
            Painel Admin do site →
          </Link>
        </div>
      </div>
    </div>
  );
}
