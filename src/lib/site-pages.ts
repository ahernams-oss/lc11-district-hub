import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PAGE_MENUS = {
  inicio: "Início", lideres: "Líderes", clubes: "Clubes e Leões", documentos: "Documentos",
  projetos: "Projetos", noticias: "Notícias", eventos: "Eventos", conexao: "Conexão Solidária",
  dados: "Dados", lcif: "LCIF",
} as const;
export type PageMenu = keyof typeof PAGE_MENUS;
export interface SitePage {
  id: string; title: string; slug: string; menu_key: PageMenu; menu_label: string;
  description: string; body: string; image_url: string; sort_order: number; published: boolean;
}
export function pageSlug(title: string) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function pagesForMenu(pages: SitePage[], menu: PageMenu) {
  return pages.filter((page) => page.published && page.menu_key === menu)
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}
export function usePublishedPages() {
  return useQuery({ queryKey: ["site-pages", "published"], queryFn: async () => {
    const { data, error } = await supabase.from("site_pages").select("*").eq("published", true).order("sort_order");
    if (error) throw error;
    return (data ?? []) as SitePage[];
  }, staleTime: 30_000 });
}