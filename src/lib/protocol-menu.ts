export const PROTOCOL_MENU_ITEMS = [
  { slug: "visita-governador-cerimonia-posse", label: "Visita do Governador e Cerimônia de Posse" },
  { slug: "codigo-etica-propositos-missao", label: "Código de Ética, Propósitos e Missão" },
  { slug: "oracoes-compromisso", label: "Oração pelo Brasil, Oração Inicial, Final, Compromisso" },
  { slug: "hinos", label: "Hinos" },
  { slug: "estrutura-clube", label: "Estrutura de Clube" },
  { slug: "cursos-treinamentos", label: "Cursos e Treinamentos" },
  { slug: "historia-lions-texto", label: "História do Lions - Texto" },
  { slug: "historia-lions-midias", label: "História do Lions - Mídias" },
  { slug: "melvin-jones", label: "Melvin Jones" },
  { slug: "helen-keller", label: "Helen Keller" },
  { slug: "programa-atividade-leitura", label: "Programa de Atividade de Leitura" },
  { slug: "avaliacao-processo-excelencia-clube", label: "Avaliação e Processo de Excelência de Clube" },
  { slug: "extensao-novos-clubes", label: "Extensão - Novos Clubes" },
  { slug: "lions-clube-universitarios", label: "Lions Clube Universitários" },
  { slug: "siglas-abreviaturas", label: "Siglas e Abreviaturas" },
  { slug: "renovacao-marca-lions", label: "Renovação da Marca Lions" },
  { slug: "invocacoes-coletanea", label: "Invocações - Coletânea" },
] as const;

export function getProtocolTopic(slug: string) {
  return PROTOCOL_MENU_ITEMS.find((item) => item.slug === slug);
}