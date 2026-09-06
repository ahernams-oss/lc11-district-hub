import { BreakableText } from "@/components/BreakableText";

type Props = {
  title?: string;
  images?: unknown;
  links?: unknown;
  categoryLabel: string;
};

export function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => (typeof v === "string" ? v.trim() : "")) : [];
}

export function PartnerLogosSection({ title, images, links, categoryLabel }: Props) {
  const urls = toStringArray(images);
  const hrefs = toStringArray(links);
  const items = urls
    .map((url, i) => ({ url, link: hrefs[i] || "" }))
    .filter((p) => p.url);

  if (items.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="partner-logos-title">
      <h2 id="partner-logos-title" className="font-display text-xl font-semibold text-foreground">
        <BreakableText text={title || `Nossos Parceiros ${categoryLabel}`} />
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p, i) => {
          const logo = (
            <img
              src={p.url}
              alt={`Logo de parceiro ${categoryLabel}`}
              loading="lazy"
              className="max-h-20 w-full object-contain sm:max-h-24"
            />
          );
          const cls =
            "flex h-28 items-center justify-center rounded-lg border border-border bg-surface p-4 transition-transform hover:scale-105";
          if (!p.link) {
            return (
              <div key={`${p.url}-${i}`} className={cls}>
                {logo}
              </div>
            );
          }
          const isExternal = /^https?:\/\//i.test(p.link);
          return (
            <a
              key={`${p.url}-${i}`}
              href={p.link}
              className={cls}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {logo}
            </a>
          );
        })}
      </div>
    </section>
  );
}
