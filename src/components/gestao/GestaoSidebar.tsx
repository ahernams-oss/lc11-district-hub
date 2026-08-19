import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  DollarSign,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  BarChart2,
  CalendarDays,
  Users2,
  Building2,
  FileBarChart,
  Tag,
  Kanban,
  MessageSquare,
  CheckSquare,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type GestaoSidebarProps = {
  pathname: string;
  onSignOut: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  accessKey: "any" | "admin" | "financeiro" | "contabil" | "crm";
  children?: NavItem[];
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Principal",
    items: [
      { to: "/gestao", label: "Dashboard", icon: LayoutDashboard, exact: true, accessKey: "any" },
    ],
  },
  {
    title: "Módulos",
    items: [
      {
        to: "/gestao/financeiro",
        label: "Financeiro",
        icon: DollarSign,
        exact: false,
        accessKey: "financeiro",
        children: [
          { to: "/gestao/financeiro/contas-pagar",   label: "Contas a Pagar",   icon: TrendingDown,   accessKey: "financeiro" },
          { to: "/gestao/financeiro/aprovacoes",     label: "Aprovação de Despesas", icon: ShieldCheck, accessKey: "financeiro" },
          { to: "/gestao/financeiro/contas-receber", label: "Contas a Receber", icon: TrendingUp,     accessKey: "financeiro" },
          { to: "/gestao/financeiro/movimentacoes",  label: "Movimentações",    icon: ArrowLeftRight, accessKey: "financeiro" },
          { to: "/gestao/financeiro/fluxo-caixa",   label: "Fluxo de Caixa",   icon: BarChart2,      accessKey: "financeiro" },
          { to: "/gestao/financeiro/orcamento",      label: "Orçamento",        icon: CalendarDays,   accessKey: "financeiro" },
          { to: "/gestao/financeiro/cobrancas",      label: "Cobranças",        icon: Users2,         accessKey: "financeiro" },
          { to: "/gestao/financeiro/contas-bancarias", label: "Contas Bancárias", icon: Building2,   accessKey: "financeiro" },
          { to: "/gestao/financeiro/categorias",     label: "Categorias",       icon: Tag,            accessKey: "financeiro" },
          { to: "/gestao/financeiro/relatorios",     label: "Relatórios",       icon: FileBarChart,   accessKey: "financeiro" },
        ],
      },
      {
        to: "/gestao/contabil",
        label: "Contábil",
        icon: BookOpen,
        exact: false,
        accessKey: "contabil",
        children: [
          { to: "/gestao/contabil/plano-contas", label: "Plano de Contas", icon: BookOpen,      accessKey: "contabil" },
          { to: "/gestao/contabil/lancamentos",  label: "Lançamentos",      icon: ArrowLeftRight, accessKey: "contabil" },
          { to: "/gestao/contabil/balancete",    label: "Balancete",        icon: FileBarChart,   accessKey: "contabil" },
        ],
      },
      {
        to: "/gestao/crm",
        label: "CRM",
        icon: Users,
        exact: false,
        accessKey: "crm",
        children: [
          { to: "/gestao/crm/contatos",   label: "Contatos & Membros", icon: Users,        accessKey: "crm" },
          { to: "/gestao/crm/funil",      label: "Funil de Prospecção",icon: Kanban,       accessKey: "crm" },
          { to: "/gestao/crm/interacoes", label: "Interações",         icon: MessageSquare,accessKey: "crm" },
          { to: "/gestao/crm/tarefas",    label: "Tarefas & Follow-up",icon: CheckSquare,   accessKey: "crm" },
        ],
      },
      {
        to: "/gestao/clubes-associados",
        label: "Clubes & Distrito",
        icon: Building2,
        exact: false,
        accessKey: "any",
        children: [
          { to: "/gestao/clubes-associados/clubes",     label: "Clubes do Distrito", icon: Building2, accessKey: "any" },
          { to: "/gestao/clubes-associados/associados", label: "Associados / Leões", icon: Users2,     accessKey: "any" },
          { to: "/gestao/nominata",                     label: "Nominata do Clube",  icon: FileBarChart,accessKey: "any" },
          { to: "/gestao/estrutura-distrital",          label: "Estrutura Distrital",icon: Award,     accessKey: "any" },
        ],
      },
      {
        to: "/gestao/documentos",
        label: "Painel Informativo",
        icon: FileBarChart,
        exact: false,
        accessKey: "any",
      },
    ],
  },
  {
    title: "Configurações",
    items: [
      { to: "/gestao/usuarios", label: "Usuários", icon: Settings, exact: false, accessKey: "admin" },
    ],
  },
];

export function GestaoSidebar({ pathname, onSignOut }: GestaoSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, isGestorAdmin, isGestorFinanceiro, isGestorContabil, isGestorCRM } = useAuth();

  // Track which parent sections are open
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    // Auto-open the section matching current path
    const s = new Set<string>();
    if (pathname.startsWith("/gestao/financeiro")) s.add("/gestao/financeiro");
    if (pathname.startsWith("/gestao/contabil")) s.add("/gestao/contabil");
    if (pathname.startsWith("/gestao/crm")) s.add("/gestao/crm");
    if (pathname.startsWith("/gestao/clubes-associados")) s.add("/gestao/clubes-associados");
    return s;
  });

  const toggleSection = (to: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(to)) next.delete(to);
      else next.add(to);
      return next;
    });
  };

  const hasAccess = (key: string) => {
    if (key === "any") return true;
    if (key === "admin") return isGestorAdmin;
    if (key === "financeiro") return isGestorFinanceiro;
    if (key === "contabil") return isGestorContabil;
    if (key === "crm") return isGestorCRM;
    return false;
  };

  const roleLabel = isGestorAdmin
    ? "Gestor Admin"
    : [
        isGestorFinanceiro && "Financeiro",
        isGestorContabil && "Contábil",
        isGestorCRM && "CRM",
      ]
        .filter(Boolean)
        .join(", ") || "Gestor";

  const renderItem = (item: NavItem, level = 0) => {
    if (!hasAccess(item.accessKey)) return null;

    const hasChildren = !!item.children?.length;
    const isOpen = openSections.has(item.to);
    const isActive = item.exact
      ? pathname === item.to
      : pathname === item.to || (hasChildren && pathname.startsWith(item.to + "/"));
    const isChildActive = hasChildren && (item.children ?? []).some((c) => pathname === c.to || pathname.startsWith(c.to + "/"));

    const linkClasses = `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      isActive || isChildActive
        ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    } ${collapsed ? "justify-center" : ""}`;

    const iconClasses = `h-[18px] w-[18px] shrink-0 ${
      isActive || isChildActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
    }`;

    if (hasChildren && !collapsed) {
      return (
        <div key={item.to}>
          <button
            onClick={() => toggleSection(item.to)}
            className={linkClasses + " w-full"}
          >
            <item.icon className={iconClasses} />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform text-slate-500 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
          {isOpen && (
            <div className="mt-1 ml-4 border-l border-white/8 pl-3 space-y-0.5">
              {(item.children ?? []).map((child) => {
                if (!hasAccess(child.accessKey)) return null;
                const childActive = pathname === child.to;
                return (
                  <Link
                    key={child.to}
                    to={child.to}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                      childActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                    }`}
                  >
                    <child.icon className={`h-3.5 w-3.5 shrink-0 ${childActive ? "text-primary" : "text-slate-600"}`} />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.to}
        to={item.to}
        className={linkClasses}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={iconClasses} />
        {!collapsed && item.label}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col border-r border-white/8 bg-[#0d1321] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-deep text-sm font-bold text-white shadow-md shadow-primary/20">
          LC
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold text-white">
              Gestão Distrital
            </div>
            <div className="truncate text-[10px] text-slate-500">
              Distrito LC-11
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((i) => hasAccess(i.accessKey));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => renderItem(item))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/8 px-3 py-4 space-y-2">
        {!collapsed && (
          <div className="px-3 mb-2">
            <div className="truncate text-xs font-medium text-slate-300">{user?.email}</div>
            <div className="mt-0.5 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
              {roleLabel}
            </div>
          </div>
        )}

        <Link
          to="/"
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Ver site" : undefined}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {!collapsed && "Ver site"}
        </Link>

        <button
          onClick={onSignOut}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-white/5 hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && "Sair"}
        </button>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-center rounded-lg py-2 text-slate-600 hover:bg-white/5 hover:text-slate-400"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
