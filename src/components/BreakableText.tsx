export function normalizeBreaks(text: string): string {
  return text.replace(/\s*\/\/\s*/g, "\n");
}

export function BreakableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const normalized = normalizeBreaks(text);
  const parts = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <span className={className}>{text}</span>;
  }
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i} className="block">
          {part}
        </span>
      ))}
    </span>
  );
}
