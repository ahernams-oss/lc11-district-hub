import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Popup = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  link_label: string | null;
  start_at: string;
  end_at: string;
  display_seconds: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export function usePopups() {
  return useQuery({
    queryKey: ["popups", "all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("popups")
        .select("*")
        .order("start_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Popup[];
    },
  });
}

export function useActivePopup() {
  return useQuery({
    queryKey: ["popups", "active-now"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { data, error } = await (supabase as any)
        .from("popups")
        .select("*")
        .eq("active", true)
        .lte("start_at", nowIso)
        .gte("end_at", nowIso)
        .order("start_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return ((data ?? [])[0] ?? null) as Popup | null;
    },
    staleTime: 60_000,
  });
}
