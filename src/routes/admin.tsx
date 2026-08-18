import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, FileText, Users, Home, MapPin, Newspaper, Calendar, Sparkles, ShieldCheck, MessageSquare, FolderArchive, Building2, Award, Activity } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Painel Admin — LC-11" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, hasPanelAccess, canViewUsers, isAdmin, isAvancado, isIntermediario, loading, signOut, devBypass } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  if (!user) return null;

  if (!hasPanelAccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold">Acesso negado</h1>
        <p className="mt-3 text-muted-foreground">
          Sua conta ({user.email}) ainda não tem permissão para acessar o painel.
          Aguarde a aprovação de um administrador.
        </p>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    );
  }

  const roleLabel = isAdmin
    ? "Administrador"
    : isAvancado
      ? "Avançado"
      : isIntermediario
        ? "Intermediário"
        : "Básico";

  const navItems = [
    { to: "/admin", label: "Início", icon: Home, exact: true, show: true },
    { to: "/admin/conteudo", label: "Conteúdo das Páginas", icon: FileText, show: true },
    { to: "/admin/lideres", label: "Líderes / Ex-Governadores", icon: Users, show: true },
    { to: "/admin/grandes-leoes", label: "Grandes Leões", icon: Award, show: true },
    { to: "/admin/regioes", label: "Regiões / Divisões / Clubes", icon: MapPin, show: true },
    { to: "/admin/clubes", label: "Gerenciar Clubes (mover)", icon: Building2, show: true },
    { to: "/admin/noticias", label: "Notícias", icon: Newspaper, show: true },
    { to: "/admin/eventos", label: "Eventos", icon: Calendar, show: true },
    { to: "/admin/projetos", label: "Projetos", icon: Sparkles, show: true },
    { to: "/admin/popups", label: "Pop-ups", icon: MessageSquare, show: true },
    { to: "/admin/documentos", label: "Documentos", icon: FolderArchive, show: true },

    { to: "/admin/auditoria", label: "Dashboard de Auditoria", icon: Activity, show: canViewUsers },
    { to: "/admin/usuarios", label: "Usuários & Acessos", icon: ShieldCheck, show: canViewUsers },
  ].filter((i) => i.show);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-1">
        <div className="mb-4">
          <div className="font-display text-lg font-bold">Painel Admin</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {roleLabel}
          </div>
        </div>
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-surface"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="mt-4 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
        >
          ← Ver site
        </Link>
      </aside>
      <main className="min-w-0">
        {devBypass && (
          <div className="mb-5 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm">
            <p className="font-semibold text-amber-700">Modo de desenvolvimento — sem sessão real</p>
            <p className="mt-1 text-amber-700/90">
              Você entrou pelo atalho de desenvolvimento, então o banco de dados recusa envios de
              imagem e gravações (erro de permissão). Faça login com sua conta de administrador
              para salvar conteúdo.
            </p>
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth" });
              }}
              className="mt-3 inline-flex rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Entrar com minha conta
            </button>
          </div>
        )}
        <Outlet />
      </main>

    </div>
  );
}
