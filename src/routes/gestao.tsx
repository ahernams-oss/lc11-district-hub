import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { GestaoSidebar } from "@/components/gestao";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/gestao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sistema de Gestão — Distrito LC-11" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GestaoLayout,
});

function GestaoLayout() {
  const { user, hasGestaoAccess, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === "/gestao/login";

  useEffect(() => {
    if (isLoginPage) return; // Don't redirect when already on login
    if (!loading && !user) {
      navigate({ to: "/gestao/login" });
    }
  }, [user, loading, navigate, isLoginPage]);

  // Login page: render with no sidebar/shell — the login component itself is full-page
  if (isLoginPage) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1629]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-slate-400">Carregando sistema...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!hasGestaoAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1629] px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-white">Acesso negado</h1>
          <p className="mt-3 text-sm text-slate-400">
            Sua conta ({user.email}) não possui permissão para acessar o Sistema de Gestão.
            Solicite acesso a um Gestor Administrador do distrito.
          </p>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/gestao/login" });
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1629] text-slate-200">
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
      <GestaoSidebar
        pathname={pathname}
        mobileOpen={menuOpen}
        onCloseMobile={() => setMenuOpen(false)}
        onSignOut={async () => {
          await signOut();
          navigate({ to: "/gestao/login" });
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate font-display text-sm font-bold text-white">Gestão Distrital</span>
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
