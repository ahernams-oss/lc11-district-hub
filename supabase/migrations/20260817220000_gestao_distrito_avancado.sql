-- ─── MÓDULO DE DISTRITO AVANÇADO (NOMINATA, PAINEL INFORMATIVO E ESTRUTURA DISTRITAL) ───

-- 1. Tabela de Vinculação Usuário <-> Clube (Controle de Acesso por Clube)
CREATE TABLE IF NOT EXISTS public.user_clubes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clube_id UUID NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, clube_id)
);

-- 2. Tabela de Nominata dos Clubes (Ano Leônico 2025/2026)
CREATE TABLE IF NOT EXISTS public.dist_nominata_clube (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id UUID NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  ano_leonico TEXT NOT NULL DEFAULT '2025/2026',
  cargo TEXT NOT NULL, -- Ex: Presidente, 1º Vice-Presidente, Secretário, Tesoureiro, Diretor de Associados (GMT), Diretor de Serviço (GST), Coordenador LCIF
  associado_id UUID REFERENCES public.dist_associados(id) ON DELETE SET NULL,
  nome_oficial TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(clube_id, ano_leonico, cargo)
);

-- 3. Tabela de Documentos Informativos (Painel Informativo da Governadoria / Tesouraria)
CREATE TABLE IF NOT EXISTS public.dist_documentos_informativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'Circular' CHECK (categoria IN ('Circular da Governadoria', 'Relatório Financeiro', 'Balancete Distrital', 'Formulários & Modelos', 'Regulamentos', 'Outros')),
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tamanho TEXT,
  autor_cargo TEXT NOT NULL DEFAULT 'Governador(a) de Distrito', -- Ex: Governador(a), Tesoureiro(a) Distrital
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Estrutura Distrital / Organograma de Cargos
CREATE TABLE IF NOT EXISTS public.dist_estrutura_cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_leonico TEXT NOT NULL DEFAULT '2025/2026',
  categoria_estrutura TEXT NOT NULL DEFAULT 'Mesa Diretora' CHECK (categoria_estrutura IN ('Mesa Diretora', 'Regiões e Divisões', 'Equipe Global (GAT/GMT/GST/GET)', 'Assessoria Distrital Specialized')),
  cargo_nome TEXT NOT NULL, -- Ex: Governador de Distrito, 1º Vice-Governador, Tesoureiro Distrital, Presidente Região A
  associado_id UUID REFERENCES public.dist_associados(id) ON DELETE SET NULL,
  nome_titular TEXT NOT NULL,
  clube_origem TEXT,
  email TEXT,
  telefone TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_clubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dist_nominata_clube ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dist_documentos_informativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dist_estrutura_cargos ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Leitura de user_clubes por todos autenticados" ON public.user_clubes FOR SELECT USING (true);
CREATE POLICY "Escrita de user_clubes por admin" ON public.user_clubes FOR ALL USING (public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Leitura de nominata por todos" ON public.dist_nominata_clube FOR SELECT USING (true);
CREATE POLICY "Escrita de nominata por gestor do clube ou admin" ON public.dist_nominata_clube FOR ALL USING (
  public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor_crm') OR
  EXISTS (SELECT 1 FROM public.user_clubes uc WHERE uc.user_id = auth.uid() AND uc.clube_id = dist_nominata_clube.clube_id)
);

CREATE POLICY "Leitura de documentos informativos por usuários logados" ON public.dist_documentos_informativos FOR SELECT USING (true);
CREATE POLICY "Escrita de documentos por governadoria ou tesouraria" ON public.dist_documentos_informativos FOR ALL USING (
  public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor_financeiro')
);

CREATE POLICY "Leitura de estrutura distrital por todos" ON public.dist_estrutura_cargos FOR SELECT USING (true);
CREATE POLICY "Escrita de estrutura distrital por gestores admin" ON public.dist_estrutura_cargos FOR ALL USING (
  public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
);

-- SEED DE NOMINATA EXEMPLO
INSERT INTO public.dist_nominata_clube (clube_id, ano_leonico, cargo, nome_oficial, email, telefone, whatsapp)
VALUES
  ('c1111111-1111-1111-1111-111111111101', '2025/2026', 'Presidente', 'CL Dr. Roberto Mendes', 'roberto.mendes@email.com', '(27) 99881-2233', '(27) 99881-2233'),
  ('c1111111-1111-1111-1111-111111111101', '2025/2026', 'Secretária', 'CaL Maria Eduarda Mendes', 'maria.mendes@email.com', '(27) 99881-2234', '(27) 99881-2234'),
  ('c1111111-1111-1111-1111-111111111101', '2025/2026', 'Tesoureiro', 'CL Fernando Machado', 'fernando@email.com', '(27) 99881-5544', '(27) 99881-5544'),
  ('c1111111-1111-1111-1111-111111111101', '2025/2026', 'Diretor de Associados (GMT)', 'CL Marcos Aurelio', 'marcos@email.com', '(27) 99771-3322', '(27) 99771-3322')
ON CONFLICT (clube_id, ano_leonico, cargo) DO NOTHING;

-- SEED DE DOCUMENTOS INFORMATIVOS DA GOVERNADORIA E TESOURARIA
INSERT INTO public.dist_documentos_informativos (titulo, descricao, categoria, arquivo_url, arquivo_nome, arquivo_tamanho, autor_cargo)
VALUES
  ('Circular Oficial da Governadoria nº 01/2025-2026', 'Orientações para o início do Ano Leônico e convocação para a 1ª Reunião do Conselho Distrital.', 'Circular da Governadoria', '/docs/circular_01_governadoria.pdf', 'circular_01_governadoria.pdf', '1.4 MB', 'Governador(a) de Distrito'),
  ('Relatório do Balancete Financeiro Distrital - 1º Trimestre', 'Prestação de contas das cotas distritais arrecadadas e despesas do trimestre.', 'Balancete Distrital', '/docs/balancete_1_trimestre_lc11.pdf', 'balancete_1_trimestre_lc11.pdf', '850 KB', 'Tesoureiro(a) Distrital'),
  ('Formulário Padrão de Relatório de Atividades dos Clubes (GST)', 'Modelo em PDF/DOC para envio mensal de relatórios de serviço ao Distrito.', 'Formulários & Modelos', '/docs/formulario_relatorio_gst.docx', 'formulario_relatorio_gst.docx', '320 KB', 'Governador(a) de Distrito')
ON CONFLICT DO NOTHING;

-- SEED DA ESTRUTURA DISTRITAL LC-11 (ANO LEÔNICO 2025/2026)
INSERT INTO public.dist_estrutura_cargos (ano_leonico, categoria_estrutura, cargo_nome, nome_titular, clube_origem, email, telefone, ordem)
VALUES
  ('2025/2026', 'Mesa Diretora', 'Governadora de Distrito', 'CaL Ana Paula Oliveira', 'Lions Clube Colatina Centro', 'governador@distritolc11.org.br', '(27) 99911-2233', 1),
  ('2025/2026', 'Mesa Diretora', '1º Vice-Governador', 'CL Dr. Roberto Mendes', 'Lions Clube Vitória Centro', 'roberto.mendes@email.com', '(27) 99881-2233', 2),
  ('2025/2026', 'Mesa Diretora', 'Secretário Distrital', 'CL Carlos Alberto Santos', 'Lions Clube Vila Velha Glória', 'secretaria@distritolc11.org.br', '(27) 99772-4455', 3),
  ('2025/2026', 'Mesa Diretora', 'Tesoureiro Distrital', 'CL João Paulo Fonseca', 'Lions Clube Cachoeiro de Itapemirim', 'tesouraria@distritolc11.org.br', '(28) 99811-5566', 4),
  ('2025/2026', 'Regiões e Divisões', 'Presidente da Região A', 'CL Dr. Roberto Mendes', 'Lions Clube Vitória Centro', 'roberto.mendes@email.com', '(27) 99881-2233', 5),
  ('2025/2026', 'Regiões e Divisões', 'Presidente da Divisão A-1', 'CL Carlos Alberto Santos', 'Lions Clube Vila Velha Glória', 'carlos.alberto@email.com', '(27) 99772-4455', 6),
  ('2025/2026', 'Equipe Global (GAT/GMT/GST/GET)', 'Coordenador GMT (Desenvolvimento de Quadro Social)', 'CL Marcos Aurelio', 'Lions Clube Vitória Centro', 'gmt@distritolc11.org.br', '(27) 99771-3322', 7),
  ('2025/2026', 'Equipe Global (GAT/GMT/GST/GET)', 'Coordenador GST (Serviços Globais)', 'CaL Maria Eduarda Mendes', 'Lions Clube Vitória Centro', 'gst@distritolc11.org.br', '(27) 99881-2234', 8),
  ('2025/2026', 'Assessoria Distrital Specialized', 'Assessor Distrital de Visão e SightFirst', 'CL Dr. Roberto Mendes', 'Lions Clube Vitória Centro', 'visao@distritolc11.org.br', '(27) 99881-2233', 9),
  ('2025/2026', 'Assessoria Distrital Specialized', 'Assessor Distrital de Meio Ambiente', 'CL Fernando Machado', 'Lions Clube Vitória Centro', 'meioambiente@distritolc11.org.br', '(27) 99881-5544', 10)
ON CONFLICT DO NOTHING;
