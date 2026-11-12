export const EVENT_YEARS = ["2026/2027", "2027/2028", "2028/2029", "2029/2030", "2030/2031"] as const;
export const DEFAULT_EVENT_YEAR = EVENT_YEARS[0];

export function eventYearFromSlug(slug: string): string | undefined {
  return EVENT_YEARS.find((year) => year.replace("/", "-") === slug);
}

export function eventsForYear<T extends { ano_leonistico: string }>(events: T[], year: string): T[] {
  return events.filter((event) => event.ano_leonistico === year);
}

export function eventYearHead(year: string, admin = false) {
  const title = `${admin ? "Gerenciar eventos" : "Eventos"} · AL ${year} — Distrito LC-11`;
  const description = `Eventos do Distrito LC-11 no ano leonístico ${year}.`;
  return { meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] };
}