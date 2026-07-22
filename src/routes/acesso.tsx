import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Lock, ShieldCheck, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/acesso")({
  head: () => ({
    meta: [
      { title: "Portal de Membros — Distrito LC-11" },
      { name: "description", content: "Acesso exclusivo a documentos e conteúdos restritos para membros Leão do Distrito LC-11." },
    ],
  }),
  component: MemberLoginPage,
});

function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Check if there is a redirect query parameter or default to /documentos
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const returnTo = params.get("returnTo") || "/documentos";

    if (!loading && user) {
      navigate({ to: returnTo as any });
    }
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo") || "/documentos";
      navigate({ to: returnTo as any });
    } catch (e: any) {
      setError(e.message ?? "Erro ao realizar login");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
  }

  if (user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Você está autenticado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conectado como <strong className="text-foreground">{user.email}</strong>. Você tem acesso aos documentos restritos aos membros.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/documentos"
            className="rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ir para Documentos Restritos
          </Link>
          <button
            onClick={async () => {
              await signOut();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-surface"
          >
            <LogOut className="h-4 w-4" /> Encerrar sessão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12">
      <Link to="/documentos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar aos documentos
      </Link>

      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Área de Membros</span>
            <h1 className="font-display text-2xl font-bold text-foreground">Portal do Membro</h1>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Acesse os documentos internos, atas e materiais de circulação restrita aos membros Leão do Distrito LC-11.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <button
            type="button"
            onClick={async () => {
              setError(null);
              setBusy(true);
              try {
                const returnTo = new URLSearchParams(window.location.search).get("returnTo") || "/documentos";
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: `${window.location.origin}${returnTo}`,
                });
                if (result.error) throw new Error(result.error.message ?? "Erro ao entrar com Google");
              } catch (e: any) {
                setError(e.message ?? "Erro ao entrar com Google");
                setBusy(false);
              }
            }}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
            </svg>
            Entrar com Conta Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">ou com e-mail</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60 transition-opacity hover:opacity-90 shadow"
          >
            {busy ? "Autenticando..." : "Entrar no Portal"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-center text-xs text-muted-foreground">
        É um administrador do site?{" "}
        <Link to="/auth" className="text-primary underline">
          Acesse a área administrativa (/auth)
        </Link>
      </div>
    </div>
  );
}
