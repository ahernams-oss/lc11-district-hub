import { supabase } from "@/integrations/supabase/client";

export type Campanha = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  conteudo: string | null;
  imagem_url: string | null;
  meta_cents: number;
  ativo: boolean;
  ordem: number;
};

export async function listCampanhas(): Promise<Campanha[]> {
  const { data, error } = await supabase
    .from("campanhas")
    .select("id, titulo, slug, descricao, conteudo, imagem_url, meta_cents, ativo, ordem")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Campanha[];
}

export async function getCampanhaBySlug(slug: string): Promise<Campanha | null> {
  const { data, error } = await supabase
    .from("campanhas")
    .select("id, titulo, slug, descricao, conteudo, imagem_url, meta_cents, ativo, ordem")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Campanha) ?? null;
}
