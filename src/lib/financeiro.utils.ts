/**
 * Formats a cent integer to BRL currency string.
 */
export function formatBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Formats an ISO date string to pt-BR format (DD/MM/YYYY).
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR");
}

/**
 * Returns a month label from a YYYY-MM string.
 */
export function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

/**
 * Returns the current year-month as "YYYY-MM".
 */
export function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Returns today as ISO date "YYYY-MM-DD".
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Generates an array of the last N months as "YYYY-MM" strings.
 */
export function lastNMonths(n: number): string[] {
  const months: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}
