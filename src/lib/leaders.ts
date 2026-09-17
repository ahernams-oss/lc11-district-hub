import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type LeaderCategory =
  | "governador"
  | "vice1"
  | "vice2"
  | "secretario"
  | "tesoureiro"
  | "gat"
  | "assessoria"
  | "ex_governador"
  | "grande_leao";

export const CATEGORY_LABELS: Record<LeaderCategory, string> = {
  governador: "Governador",
  vice1: "1º Vice-Governador",
  vice2: "2º Vice-Governador",
  secretario: "Secretário Distrital",
  tesoureiro: "Tesoureiro Distrital",
  gat: "GAT — Equipe de Ação Global",
  assessoria: "Assessorias",
  ex_governador: "Ex-Governador",
  grande_leao: "Grandes Leões",
};

export interface Leader {
  id: string;
  category: LeaderCategory;
  name: string;
  role: string | null;
  bio: string | null;
  message: string | null;
  photo_url: string | null;
  pin_url: string | null;
  email: string | null;
  phone: string | null;
  year_label: string | null;
  motto: string | null;
  leonic_year: string | null;
  order_index: number;
  gallery_urls: string[] | null;
  club_name: string | null;
}

export function useLeader(id: string) {
  return useQuery({
    queryKey: ["leaders", "one", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("leaders_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Leader | null;
    },
    enabled: !!id,
  });
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
      const { data, error } = await (supabase as any)
        .from("leaders_public")
        .select("*")
        .order("category", { ascending: true })
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Leader[];
    },
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

async function uploadViaServer(file: File, folder: string): Promise<string> {
  const { uploadSiteImage } = await import("@/lib/uploads.functions");
  const base64 = await fileToDataUrl(file);
  const res = await uploadSiteImage({
    data: { file: base64, filename: file.name || "imagem.jpg", folder },
  });
  return res.url;
}

export async function uploadLeaderPhoto(file: File): Promise<string> {
  return uploadViaServer(file, "leaders");
}

export async function uploadContentImage(file: File, folder = "content"): Promise<string> {
  return uploadViaServer(file, folder);
}
