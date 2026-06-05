import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, FileText, Users, Home, MapPin, Newspaper, Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Painel Admin — LC-11" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="font-display text-2xl font-bold">Acesso negado</h1>
        <p className="mt-3 text-muted-foreground">
          Sua conta ({user.email}) ainda não tem permissão de administrador.
        </p>
        <div className="mt-4 rounded-md bg-surface p-4 text-sm">
          <p className="font-semibold">Para tornar esta conta administradora:</p>
          <p className="mt-2 text-muted-foreground">
            Abra o backend do projeto, vá em <strong>SQL Editor</strong> e execute:
          </p>
          <pre className="mt-2 overflow-x-auto rounded bg-background p-3 text-xs">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
          </pre>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    );
  }

  const navItems = [
    { to: "/admin", label: "Início", icon: Home, exact: true },
    { to: "/admin/conteudo", label: "Conteúdo das Páginas", icon: FileText },
    { to: "/admin/lideres", label: "Líderes / Ex-Governadores", icon: Users },
    { to: "/admin/regioes", label: "Regiões / Divisões / Clubes", icon: MapPin },
    { to: "/admin/noticias", label: "Notícias", icon: Newspaper },
    { to: "/admin/eventos", label: "Eventos", icon: Calendar },
    { to: "/admin/projetos", label: "Projetos", icon: Sparkles },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-1">
        <div className="mb-4">
          <div className="font-display text-lg font-bold">Painel Admin</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
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
            await supabase.auth.signOut();
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
        <Outlet />
      </main>
    </div>
  );
}
