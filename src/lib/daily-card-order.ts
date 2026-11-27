export const CARD_ORDER_PERIOD_MS = 24 * 60 * 60 * 1000;

export function cardOrderPeriod(timestamp: number): number {
  return Math.floor(timestamp / CARD_ORDER_PERIOD_MS);
}

/** A shared, seeded daily shuffle; never mutates the source list. */
export function dailyCardOrder<T>(items: readonly T[], key: (item: T) => string, period: number): T[] {
  const result = [...items].sort((a, b) => key(a).localeCompare(key(b)));
  let seed = (period ^ 0x6d2b79f5) >>> 0;
  const random = () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) continue;
    result[i] = b;
    result[j] = a;
  }
  return result;
}