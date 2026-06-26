import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DocumentItem = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  file_url: string | null;
  external_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export const DOCUMENT_CATEGORIES: { slug: string; label: string }[] = [
  { slug: "atos-governador-al-2026-2027", label: "Atos do(a) Governador(a) — AL 2026-2027" },
  { slug: "atos-governador-al-2027-2028", label: "Atos do(a) Governador(a) — AL 2027-2028" },
  { slug: "estatuto-lions-internacional", label: "Estatuto Lions Internacional" },
  { slug: "estatuto-dmlc", label: "Estatuto DMLC" },
  { slug: "estatuto-distrito-lc-11", label: "Estatuto Distrito LC-11" },
  { slug: "estatuto-padrao-clubes", label: "Estatuto Padrão dos Clubes" },
  { slug: "regulamento-sede", label: "Regulamento da Sede" },
];

export function useDocuments(category?: string) {
  return useQuery({
    queryKey: ["documents", category ?? "all"],
    queryFn: async () => {
      let q = (supabase as any).from("documents").select("*");
      if (category) q = q.eq("category", category);
      const { data, error } = await q
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DocumentItem[];
    },
    staleTime: 30_000,
  });
}
