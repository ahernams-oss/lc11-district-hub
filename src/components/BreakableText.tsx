import type { ReactNode } from "react";

/**
 * Replaces "//" with newlines for flexible break control in CMS fields.
 */
export function normalizeBreaks(text: string): string {
  return text.replace(/\s*(?<!:)\/\/\s*/g, "\n");
}

function renderFormattedLines(text: string): ReactNode[][] {
  let bold = false;

  return normalizeBreaks(text || "").split("\n").map((line, lineIndex) => {
    const segments: ReactNode[] = [];
    const parts = line.split("**");

    parts.forEach((part, partIndex) => {
      if (part) {
        segments.push(
          bold
            ? <strong key={`${lineIndex}-${partIndex}`} className="font-bold">{part}</strong>
            : part,
        );
      }
      if (partIndex < parts.length - 1) bold = !bold;
    });

    return segments;
  });
}

/**
 * Renders text with **double asterisks** as <strong> elements.
 */
export function BoldText({ text }: { text: string }): ReactNode {
  const lines = renderFormattedLines(text);
  return lines.map((line, index) => (
    <span key={index}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
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
  const lines = renderFormattedLines(text);
  
  if (lines.length <= 1) {
    return (
      <span className={className}>
        {lines[0]}
      </span>
    );
  }
  
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}
