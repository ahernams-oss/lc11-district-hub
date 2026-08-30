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
  is_restricted?: boolean;
  required_role?: "membro" | "diretoria" | "admin";
  created_at: string;
  updated_at: string;
};

export const REQUIRED_ROLE_LABELS: Record<string, string> = {
  membro: "Membros Leão (Logados)",
  diretoria: "Diretoria & Painel",
  admin: "Administradores",
};

export const RGD_YEARS = ["2026-2027", "2027-2028", "2028-2029"] as const;
export const RGD_ITEMS = [
  { suffix: "1-rgd", label: "1ª RGD" },
  { suffix: "2-rgd", label: "2ª RGD" },
  { suffix: "3-rgd", label: "3ª RGD" },
  { suffix: "4-rgd", label: "4ª RGD" },
  { suffix: "convencao", label: "Convenção" },
] as const;

const RGD_CATEGORIES = RGD_YEARS.flatMap((y) =>
  RGD_ITEMS.map((it) => ({
    slug: `rgds-convencao-al-${y}-${it.suffix}`,
    label: `RGDs e Convenção — AL ${y} — ${it.label}`,
  })),
);

export const DOCUMENT_CATEGORIES: { slug: string; label: string }[] = [
  { slug: "atos-governador-al-2026-2027", label: "Atos do(a) Governador(a) — AL 2026-2027" },
  { slug: "atos-governador-al-2027-2028", label: "Atos do(a) Governador(a) — AL 2027-2028" },
  ...RGD_CATEGORIES,
  { slug: "estatuto-lions-internacional", label: "Estatuto Lions Internacional" },
  { slug: "estatuto-dmlc", label: "Estatuto DMLC" },
  { slug: "estatuto-distrito-lc-11", label: "Estatuto Distrito LC-11" },
  { slug: "estatuto-padrao-clubes", label: "Estatuto Padrão dos Clubes" },
  { slug: "regulamento-sede", label: "Regulamento da Sede" },
];

export type DocumentCategory = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  active: boolean;
};

export function slugifyCategory(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Categorias cadastradas no painel admin (com fallback para a lista padrão). */
export function useDocumentCategories(opts?: { includeInactive?: boolean }) {
  const includeInactive = opts?.includeInactive ?? false;
  return useQuery({
    queryKey: ["document-categories", includeInactive ? "all" : "active"],
    queryFn: async () => {
      let q = (supabase as any).from("document_categories").select("*");
      if (!includeInactive) q = q.eq("active", true);
      const { data, error } = await q
        .order("sort_order", { ascending: true })
        .order("label", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as DocumentCategory[];
      if (rows.length === 0) {
        return DOCUMENT_CATEGORIES.map((c, i) => ({
          id: c.slug,
          slug: c.slug,
          label: c.label,
          sort_order: (i + 1) * 10,
          active: true,
        })) as DocumentCategory[];
      }
      return rows;
    },
    staleTime: 30_000,
  });
}

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

