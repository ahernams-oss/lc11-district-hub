import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const VISITOR_ID_KEY = "lc11_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export async function recordSiteVisit(path: string) {
  if (typeof window === "undefined") return;
  // Ignore admin paths from visitor stats
  if (path.startsWith("/admin")) return;

  const sessionKey = `lc11_visited_${path}_${new Date().toISOString().slice(0, 10)}`;
  if (sessionStorage.getItem(sessionKey)) return; // Already recorded today in this session

  sessionStorage.setItem(sessionKey, "true");
  const visitorId = getVisitorId();

  try {
    const { error } = await (supabase as any).from("site_visits").insert({
      path: path || "/",
      visitor_id: visitorId,
    });
    if (error) {
      console.warn("Aviso ao registrar visita no Supabase:", error.message);
    }
  } catch (err) {
    console.warn("Falha ao registrar visita:", err);
  }
}

export type SiteVisitsStats = {
  totalVisits: number;
  uniqueVisitors: number;
  visitsToday: number;
  topPages: { path: string; count: number }[];
};

const EMPTY_STATS: SiteVisitsStats = {
  totalVisits: 0,
  uniqueVisitors: 0,
  visitsToday: 0,
  topPages: [],
};

export function useSiteVisitsStats() {
  return useQuery({
    queryKey: ["site-visits-stats"],
    queryFn: async (): Promise<SiteVisitsStats> => {
      try {
        const { data, error, count } = await (supabase as any)
          .from("site_visits")
          .select("*", { count: "exact" });

        if (error || !data || data.length === 0) {
          return EMPTY_STATS;
        }

        const uniqueSet = new Set(data.map((d: any) => d.visitor_id));
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayVisits = data.filter((d: any) => d.created_at?.startsWith(todayStr)).length;

        // Top pages count
        const pageCounts: Record<string, number> = {};
        for (const row of data) {
          pageCounts[row.path || "/"] = (pageCounts[row.path || "/"] || 0) + 1;
        }

        const topPages = Object.entries(pageCounts)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          totalVisits: count ?? data.length,
          uniqueVisitors: uniqueSet.size,
          visitsToday: todayVisits,
          topPages,
        };
      } catch {
        return EMPTY_STATS;
      }
    },
    staleTime: 15_000,
  });
}
