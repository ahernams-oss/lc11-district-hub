import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  tag: string | null;
  published: boolean;
  published_at: string;
}

export function useNews(publishedOnly = false) {
  return useQuery({
    queryKey: ["news", publishedOnly],
    queryFn: async () => {
      let q = supabase.from("news").select("*").order("published_at", { ascending: false });
      if (publishedOnly) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
  });
}

export function useNewsItem(id: string | undefined) {
  return useQuery({
    queryKey: ["news", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as NewsItem | null;
    },
  });
}
