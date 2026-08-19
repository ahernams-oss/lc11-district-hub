import { ChevronRight } from "lucide-react";

type Breadcrumb = string | { label: string; to?: string };

type GestaoHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
};

export function GestaoHeader({ title, subtitle, breadcrumbs, actions }: GestaoHeaderProps) {
  return (
    <header className="border-b border-white/8 bg-[#0f1629]/80 px-4 py-4 backdrop-blur-sm sm:px-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2 flex items-center gap-1 text-xs text-slate-500">
          {breadcrumbs.map((raw, i) => {
            const crumb = typeof raw === "string" ? { label: raw, to: undefined } : raw;
            return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
              {crumb.to ? (
                <a href={crumb.to} className="hover:text-slate-300 transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-slate-400">{crumb.label}</span>
              )}
            </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
