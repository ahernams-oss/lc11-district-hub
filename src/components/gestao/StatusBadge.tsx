type StatusBadgeProps = {
  status: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  size?: "sm" | "md";
};

const VARIANT_MAP: Record<string, StatusBadgeProps["variant"]> = {
  pago: "success",
  recebido: "success",
  conciliado: "success",
  ativo: "success",
  fechado: "success",
  pendente: "warning",
  aberto: "warning",
  parcial: "warning",
  vencido: "danger",
  cancelado: "danger",
  inativo: "muted",
  rascunho: "muted",
};

const VARIANT_STYLES = {
  default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  muted: "bg-white/5 text-slate-500 border-white/10",
};

export function StatusBadge({ status, variant, size = "sm" }: StatusBadgeProps) {
  const resolved = variant ?? VARIANT_MAP[status.toLowerCase()] ?? "default";
  const styles = VARIANT_STYLES[resolved];
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wide ${styles} ${sizeClass}`}
    >
      {status}
    </span>
  );
}
