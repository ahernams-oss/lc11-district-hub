export function BreakHint({ className }: { className?: string }) {
  return (
    <p className={className ?? "mt-1 text-[11px] text-muted-foreground"}>
      Use <code className="rounded bg-surface px-1">//</code> para quebrar a linha no site.
    </p>
  );
}
