import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentKey =
  | "home"
  | "lions-internacional"
  | "sobre"
  | "historia"
  | "gat"
  | "assessoria"
  | "ex-governadores"
  | "governador"
  | "vice-governador-1"
  | "vice-governador-2"
  | "lcif";

export const CONTENT_LABELS: Record<ContentKey, string> = {
  home: "Página Início (hero)",
  "lions-internacional": "Sobre o Lions Internacional",
  sobre: "Sobre o Distrito LC-11",
  historia: "Nossa História",
  gat: "GAT",
  assessoria: "Assessoria",
  "ex-governadores": "Galeria de Ex-Governadores",
  governador: "Página Governador (textos)",
  "vice-governador-1": "Página 1º Vice (textos)",
  "vice-governador-2": "Página 2º Vice (textos)",
  lcif: "Página LCIF",
};

export function useSiteContent<T extends Record<string, any>>(key: ContentKey, defaults: T) {
  const q = useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("data")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return (data?.data ?? null) as T | null;
    },
    staleTime: 30_000,
  });
  return { ...defaults, ...(q.data ?? {}) } as T;
}

export async function saveSiteContent(key: ContentKey, data: Record<string, any>) {
  const { error } = await supabase
    .from("site_content")
    .upsert({ key, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function fetchSiteContent(key: ContentKey) {
  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", key)
    .maybeSingle();
  return (data?.data ?? {}) as Record<string, any>;
}
