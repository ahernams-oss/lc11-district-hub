import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 opacity-20" aria-hidden>
        <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold blur-3xl" />
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary-deep blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {eyebrow && (
          <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-gold text-base">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl font-display font-bold leading-tight sm:text-5xl lg:text-6xl text-8xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed opacity-90">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
