import type { ReactNode } from "react";

/**
 * Replaces "//" with newlines for flexible break control in CMS fields.
 */
export function normalizeBreaks(text: string): string {
  return text.replace(/\s*\/\/\s*/g, "\n");
}

/**
 * Renders text with **double asterisks** as <strong> elements.
 */
export function BoldText({ text }: { text: string }): ReactNode {
  if (!text || !text.includes("**")) return text || "";
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
}

/**
 * Central component for rendering CMS text.
 * Handles:
 * 1. "//" as line breaks
 * 2. "**bold**" markdown
 * 3. Multi-line block rendering
 */
export function BreakableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const normalized = normalizeBreaks(text || "");
  const parts = normalized.split("\n").map((s) => s.trim()).filter(Boolean);
  
  if (parts.length <= 1) {
    return (
      <span className={className}>
        <BoldText text={normalized} />
      </span>
    );
  }
  
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i} className="block">
          <BoldText text={part} />
        </span>
      ))}
    </span>
  );
}
