import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderCategory =
  | "governador"
  | "vice1"
  | "vice2"
  | "gat"
  | "assessoria"
  | "ex_governador";

export const CATEGORY_LABELS: Record<LeaderCategory, string> = {
  governador: "Governador",
  vice1: "1º Vice-Governador",
  vice2: "2º Vice-Governador",
  gat: "GAT — Grupo de Ação e Trabalho",
  assessoria: "Assessoria",
  ex_governador: "Ex-Governador",
};

export interface Leader {
  id: string;
  category: LeaderCategory;
  name: string;
  role: string | null;
  bio: string | null;
  message: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  year_label: string | null;
  motto: string | null;
  order_index: number;
}

export function useLeaders(category: LeaderCategory) {
  return useQuery({
    queryKey: ["leaders", category],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leaders_public")
        .select("*")
        .eq("category", category)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Leader[];
    },
    staleTime: 30_000,
  });
}

export function useAllLeaders() {
  return useQuery({
    queryKey: ["leaders", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .order("category", { ascending: true })
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Leader[];
    },
  });
}

export async function uploadLeaderPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `leaders/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = await supabase.storage
    .from("site-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  return data?.signedUrl ?? "";
}

export async function uploadContentImage(file: File, folder = "content"): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("site-images").upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = await supabase.storage
    .from("site-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  return data?.signedUrl ?? "";
}
