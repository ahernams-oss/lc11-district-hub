import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteMusic = {
  id: string;
  title: string;
  file_url: string;
  start_at: string;
  end_at: string;
  volume: number;
  loop: boolean;
  active: boolean;
};

/** Uma música toca somente se ativa e se agora estiver entre início e fim. */
export function isMusicLive(m: Pick<SiteMusic, "active" | "start_at" | "end_at">, now: Date = new Date()) {
  return m.active && new Date(m.start_at) <= now && new Date(m.end_at) > now;
}

export function useAllMusic() {
  return useQuery({
    queryKey: ["site_music", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_music").select("*").order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SiteMusic[];
    },
  });
}

export function useActiveMusic() {
  return useQuery({
    queryKey: ["site_music", "active"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("site_music")
        .select("*")
        .eq("active", true)
        .lte("start_at", nowIso)
        .gt("end_at", nowIso)
        .order("start_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as SiteMusic | null;
    },
    staleTime: 60_000,
  });
}
