import type { Database } from "@/integrations/supabase/types";

export type ReportTable = keyof Database["public"]["Tables"];
export type ReportSource = {
  id: string; label: string; table?: ReportTable;
  filter?: { column: string; value: string; exclude?: boolean };
  access?: "users" | "admin";
};
export const ADMIN_REPORT_SOURCES: ReportSource[] = [
  { id: "inicio", label: "Início — Resumo do painel" },
  { id: "conteudo", label: "Conteúdo das Páginas", table: "site_content" },
  { id: "subpaginas", label: "Subpáginas dos Menus", table: "site_pages" },
  { id: "lideres", label: "Líderes / Ex-Governadores", table: "leaders", filter: { column: "category", value: "grande_leao", exclude: true } },
  { id: "grandes-leoes", label: "Grandes Leões", table: "leaders", filter: { column: "category", value: "grande_leao" } },
  { id: "regioes", label: "Regiões", table: "regions" },
  { id: "divisoes", label: "Divisões", table: "divisions" },
  { id: "clubes", label: "Clubes / Gerenciar Clubes", table: "clubs" },
  { id: "noticias", label: "Notícias", table: "news" },
  { id: "eventos", label: "Eventos — Todos os anos", table: "events" },
  { id: "inscricoes", label: "Eventos — Inscrições", table: "event_inscricoes", access: "admin" },
  { id: "projetos", label: "Projetos", table: "projects" },
  { id: "popups", label: "Pop-ups", table: "popups" },
  { id: "musica", label: "Música do Site", table: "site_music" },
  { id: "conexao", label: "Conexão Solidária", table: "site_content" },
  { id: "documentos", label: "Documentos", table: "documents" },
  { id: "categorias", label: "Documentos — Categorias", table: "document_categories" },
  { id: "campanhas", label: "Campanhas de Doação", table: "campanhas" },
  { id: "doacoes", label: "Doações & Comprovantes", table: "donations", access: "admin" },
  { id: "assinaturas", label: "Doações — Assinaturas", table: "donation_subscriptions", access: "admin" },
  { id: "auditoria", label: "Dashboard de Auditoria — Documentos", table: "document_audit_logs", access: "users" },
  { id: "visitas", label: "Dashboard de Auditoria — Visitas", table: "site_visits", access: "users" },
  { id: "usuarios", label: "Usuários & Acessos", access: "users" },
  { id: "perfis", label: "Usuários — Perfis atribuídos", table: "user_roles", access: "users" },
  { id: "vinculos-clubes", label: "Usuários — Vínculos com clubes", table: "usuarios_clubes", access: "users" },
  { id: "vinculos-distritos", label: "Usuários — Vínculos com distritos", table: "usuarios_distritos", access: "users" },
];

export type ExportValue = string | number | boolean;
export type ExportRecord = Record<string, ExportValue>;
export type AdminReportSection = { id: string; label: string; rows: ExportRecord[]; columns: string[] };

const labels: Record<string, string> = {
  id: "Identificador", name: "Nome", title: "Título", key: "Página", data: "Conteúdo",
  description: "Descrição", bio: "Biografia", body: "Texto", content: "Conteúdo",
  created_at: "Cadastro", updated_at: "Atualização", category: "Categoria", role: "Cargo / Perfil",
  email: "E-mail", phone: "Telefone", club_name: "Clube", leonic_year: "Ano Leonístico",
  year_label: "Ano / Selo", photo_url: "Link da foto", pin_url: "Link do PIN", gallery_urls: "Galeria",
  image_url: "Link da imagem", file_url: "Link do arquivo", external_url: "Link externo",
  published: "Publicado", active: "Ativo", sort_order: "Ordem", order_index: "Ordem",
  start_at: "Início", end_at: "Fim", state: "Estado", city: "Cidade", address: "Endereço",
  district_id: "Distrito", distrito_id: "Distrito", division_id: "Divisão", region_id: "Região",
  user_id: "Usuário", clube_id: "Clube", status: "Status", payment_status: "Status do pagamento",
  amount: "Valor (centavos)", currency: "Moeda", customer_name: "Doador", customer_email: "E-mail do doador",
  receipt_number: "Comprovante", environment: "Ambiente", kind: "Tipo", reference_label: "Referência",
  document_title: "Documento", user_email: "E-mail do usuário", action: "Ação", path: "Página visitada",
  roles: "Perfis", highest_role: "Perfil principal", last_sign_in_at: "Último acesso",
  is_admin: "Administrador", label: "Nome", slug: "Endereço da página", menu_key: "Menu principal",
  menu_label: "Nome no menu", parent_id: "Categoria superior", is_restricted: "Restrito",
  required_role: "Perfil necessário", volume: "Volume", loop: "Repetir", message: "Mensagem", motto: "Lema",
};
export function reportFieldLabel(field: string): string {
  return field.split(".").map((part) => labels[part] ?? part.replaceAll("_", " ")).join(" / ");
}

/** Preserve every nested field and URL, splitting strings at Excel's cell limit. */
export function flattenReportRecord(record: object): ExportRecord {
  const result: ExportRecord = {};
  const visit = (value: unknown, path: string) => {
    if (value === null || value === undefined) { result[path] = ""; return; }
    if (Array.isArray(value)) {
      if (!value.length) result[path] = "[]";
      value.forEach((item: unknown, index: number) => visit(item, `${path}.${index + 1}`));
    } else if (typeof value === "object") {
      const entries = Object.entries(value);
      if (!entries.length) result[path] = "{}";
      entries.forEach(([key, child]) => visit(child, path ? `${path}.${key}` : key));
    } else if (typeof value === "string" && value.length > 30_000) {
      for (let offset = 0; offset < value.length; offset += 30_000) result[`${path}.parte ${offset / 30_000 + 1}`] = value.slice(offset, offset + 30_000);
    } else if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") result[path] = value;
    else result[path] = String(value);
  };
  visit(record, "");
  return result;
}

export async function readAllReportPages<T>(fetchPage: (offset: number, size: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const batch = await fetchPage(offset, 500);
    rows.push(...batch);
    if (batch.length < 500) return rows;
  }
}

export function makeReportSection(source: ReportSource, records: object[]): AdminReportSection {
  const rows = records.map(flattenReportRecord);
  return { id: source.id, label: source.label, rows, columns: [...new Set(rows.flatMap((row) => Object.keys(row)))] };
}