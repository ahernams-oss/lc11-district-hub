import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectItem {
  id: string;
  title: string;
  tag: string | null;
  description: string | null;
  content: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  order_index: number;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index")
        .order("title");
      if (error) throw error;
      return (data ?? []) as ProjectItem[];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as ProjectItem | null;
    },
  });
}
