import { useEffect, useState } from "react";
import { CARD_ORDER_PERIOD_MS, cardOrderPeriod } from "@/lib/daily-card-order";

export function useDailyCardPeriod() {
  // Identical server and initial browser state avoids hydration mismatches.
  const [period, setPeriod] = useState<number | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const now = Date.now();
      setPeriod(cardOrderPeriod(now));
      clearTimeout(timer);
      timer = setTimeout(refresh, CARD_ORDER_PERIOD_MS - (now % CARD_ORDER_PERIOD_MS));
    };
    refresh();
    // Background tabs may suspend timers; catch up when returning.
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return period;
}