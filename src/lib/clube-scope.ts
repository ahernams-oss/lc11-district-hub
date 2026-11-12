/**
 * Restrição por clube: se o usuário tiver vínculos em usuarios_clubes,
 * só enxerga/altera dados desses clubes. Admins nunca são restritos.
 * Retorna null quando não há restrição.
 */
export async function clubeScope(userId: string): Promise<string[] | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if ((roles ?? []).some((r: any) => ["admin", "gestor_admin"].includes(String(r.role)))) return null;
  const { data } = await (supabaseAdmin as any).from("usuarios_clubes").select("clube_id").eq("user_id", userId);
  const ids = (data ?? []).map((r: any) => r.clube_id as string);
  return ids.length ? ids : null;
}

export async function assertClubePermitido(userId: string, clubeId: string | null | undefined) {
  const scope = await clubeScope(userId);
  if (scope && (!clubeId || !scope.includes(clubeId))) {
    throw new Error("Acesso negado: você só pode acessar dados do seu clube.");
  }
}

export async function assertSemRestricaoClube(userId: string) {
  if (await clubeScope(userId)) throw new Error("Acesso negado: usuário restrito ao próprio clube.");
}

export async function clubeDoAssociado(id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("dist_associados").select("clube_id").eq("id", id).maybeSingle();
  return data?.clube_id as string | undefined;
}
export async function clubeDaNominata(id: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("dist_nominata_clube").select("clube_id").eq("id", id).maybeSingle();
  return data?.clube_id as string | undefined;
}
