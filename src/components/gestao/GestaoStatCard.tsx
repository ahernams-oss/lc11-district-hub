import { type LucideIcon } from "lucide-react";

type StatCardProps = {
  label?: string;
  title?: string;
  subtitle?: string;
  color?: string;
  value: string | number;
  loading?: boolean;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  variant?: "default" | "success" | "warning" | "danger" | "info";
};

const VARIANT_STYLES = {
  default: {
    icon: "bg-primary/10 text-primary",
    trend: "text-slate-400",
  },
  success: {
    icon: "bg-emerald-500/10 text-emerald-400",
    trend: "text-emerald-400",
  },
  warning: {
    icon: "bg-amber-500/10 text-amber-400",
    trend: "text-amber-400",
  },
  danger: {
    icon: "bg-red-500/10 text-red-400",
    trend: "text-red-400",
  },
  info: {
    icon: "bg-blue-500/10 text-blue-400",
    trend: "text-blue-400",
  },
};

export function GestaoStatCard({
  label,
  title,
  subtitle,
  value,
  loading,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label ?? title}
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
            ) : (
              value
            )}
          </div>
          {subtitle && !loading && (
            <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
          )}
          {trend && !loading && (
            <div className={`mt-1 text-xs ${styles.trend}`}>
              {trend.value > 0 ? "↑" : trend.value < 0 ? "↓" : "→"}{" "}
              {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
