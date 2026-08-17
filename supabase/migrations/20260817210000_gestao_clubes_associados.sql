-- ─── MÓDULO DE CADASTRO DE CLUBES E ASSOCIADOS (DISTRITO LC-11) ───

-- 1. Tabela de Clubes do Distrito
CREATE TABLE IF NOT EXISTS public.dist_clubes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  codigo_lions TEXT, -- Código do Clube na LCI (Lions Clubs International)
  charter_date DATE, -- Data da Carta Constitutiva
  regiao TEXT NOT NULL DEFAULT 'Região A',
  divisao TEXT NOT NULL DEFAULT 'Divisão A-1',
  cidade TEXT NOT NULL DEFAULT 'Vitória',
  estado TEXT NOT NULL DEFAULT 'ES',
  cep TEXT,
  endereco TEXT,
  email TEXT,
  telefone TEXT,
  dia_reuniao TEXT, -- Ex: 2ª e 4ª Quinta-feira
  horario_reuniao TEXT, -- Ex: 20:00
  local_reuniao TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_processo')),
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Associados (Leões, Leos e Companheiros)
CREATE TABLE IF NOT EXISTS public.dist_associados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id UUID NOT NULL REFERENCES public.dist_clubes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  data_nascimento DATE,
  data_admissao DATE,
  cargo_clube TEXT DEFAULT 'Membro', -- Ex: Presidente, Secretário, Tesoureiro, Membro
  cargo_distrital TEXT, -- Ex: Governador, Vice-Governador, Assessor Distrital
  categoria TEXT NOT NULL DEFAULT 'ativo' CHECK (categoria IN ('ativo', 'honorario', 'privilegiado', 'vitalicio', 'ausente')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'desligado', 'licenciado')),
  nome_conjuge TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dist_clubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dist_associados ENABLE ROW LEVEL SECURITY;

-- Triggers de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_dist()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_updated_at_dist_clubes
  BEFORE UPDATE ON public.dist_clubes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_dist();

CREATE TRIGGER trg_set_updated_at_dist_associados
  BEFORE UPDATE ON public.dist_associados
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_dist();

-- RLS Policies
CREATE POLICY "Leitura de clubes por todos autenticados ou gestores" ON public.dist_clubes
  FOR SELECT USING (true);

CREATE POLICY "Escrita de clubes por gestores" ON public.dist_clubes
  FOR ALL USING (
    public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_financeiro')
  );

CREATE POLICY "Leitura de associados por todos autenticados ou gestores" ON public.dist_associados
  FOR SELECT USING (true);

CREATE POLICY "Escrita de associados por gestores" ON public.dist_associados
  FOR ALL USING (
    public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_financeiro')
  );

-- SEED DE DEMONSTRAÇÃO DOS CLUBES DO DISTRITO LC-11
INSERT INTO public.dist_clubes (id, nome, codigo_lions, charter_date, regiao, divisao, cidade, dia_reuniao, horario_reuniao, email, telefone, status)
VALUES
  ('c1111111-1111-1111-1111-111111111101', 'Lions Clube Vitória Centro', '034123', '1965-04-12', 'Região A', 'Divisão A-1', 'Vitória', '2ª e 4ª Quinta-feira', '20:00', 'vitoriacentro@distritolc11.org.br', '(27) 3322-1100', 'ativo'),
  ('c1111111-1111-1111-1111-111111111102', 'Lions Clube Vila Velha Glória', '034124', '1972-08-20', 'Região A', 'Divisão A-1', 'Vila Velha', '1ª e 3ª Quarta-feira', '19:30', 'vilavelhagloria@distritolc11.org.br', '(27) 3329-4455', 'ativo'),
  ('c1111111-1111-1111-1111-111111111103', 'Lions Clube Cachoeiro de Itapemirim', '034125', '1958-11-05', 'Região B', 'Divisão B-1', 'Cachoeiro de Itapemirim', '2ª e 4ª Terça-feira', '20:00', 'cachoeiro@distritolc11.org.br', '(28) 3522-8899', 'ativo'),
  ('c1111111-1111-1111-1111-111111111104', 'Lions Clube Colatina Centro', '034126', '1968-03-15', 'Região C', 'Divisão C-1', 'Colatina', '1ª e 3ª Quinta-feira', '20:00', 'colatina@distritolc11.org.br', '(27) 3722-5500', 'ativo'),
  ('c1111111-1111-1111-1111-111111111105', 'Lions Clube Linhares', '034127', '1975-06-18', 'Região C', 'Divisão C-2', 'Linhares', '2ª e 4ª Segunda-feira', '19:30', 'linhares@distritolc11.org.br', '(27) 3371-3322', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- SEED DE ASSOCIADOS DEMO
INSERT INTO public.dist_associados (clube_id, nome, email, telefone, whatsapp, cargo_clube, cargo_distrital, categoria, status)
VALUES
  ('c1111111-1111-1111-1111-111111111101', 'CL Dr. Roberto Mendes', 'roberto.mendes@email.com', '(27) 99881-2233', '(27) 99881-2233', 'Presidente', 'Assessor Distrital de Visão', 'ativo', 'ativo'),
  ('c1111111-1111-1111-1111-111111111101', 'CaL Maria Eduarda Mendes', 'maria.mendes@email.com', '(27) 99881-2234', '(27) 99881-2234', 'Secretária', NULL, 'ativo', 'ativo'),
  ('c1111111-1111-1111-1111-111111111102', 'CL Carlos Alberto Santos', 'carlos.alberto@email.com', '(27) 99772-4455', '(27) 99772-4455', 'Presidente', 'Presidente da Divisão A-1', 'ativo', 'ativo'),
  ('c1111111-1111-1111-1111-111111111103', 'CL João Paulo Fonseca', 'joao.fonseca@email.com', '(28) 99811-5566', '(28) 99811-5566', 'Tesoureiro', NULL, 'ativo', 'ativo'),
  ('c1111111-1111-1111-1111-111111111104', 'CaL Ana Paula Oliveira', 'ana.paula@email.com', '(27) 99911-2233', '(27) 99911-2233', 'Presidente', 'Governadora de Distrito 2025/2026', 'vitalicio', 'ativo');
