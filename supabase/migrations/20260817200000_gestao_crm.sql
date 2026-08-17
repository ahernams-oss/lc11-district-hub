-- ─── MÓDULO CRM (GESTAO DISTRITAL) ──────────────────────────────
-- Tabela de Contatos & Membros / Prospecções
CREATE TABLE IF NOT EXISTS public.crm_contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  clube_id UUID,
  clube_nome TEXT,
  cargo TEXT,
  tipo TEXT NOT NULL DEFAULT 'prospeccao' CHECK (tipo IN ('membro', 'prospeccao', 'doador_parceiro', 'autoridade', 'outro')),
  estagio_funil TEXT NOT NULL DEFAULT 'novo' CHECK (estagio_funil IN ('novo', 'primeiro_contato', 'convidado_reuniao', 'visita_realizada', 'proposta', 'filiado', 'perdido')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_andamento', 'convertido', 'inativo')),
  origem TEXT,
  observacoes TEXT,
  tags TEXT[] DEFAULT '{}',
  valor_estimado NUMERIC(12,2) DEFAULT 0.00,
  responsavel_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Histórico de Interações (Ligações, WhatsApp, Reuniões, E-mails)
CREATE TABLE IF NOT EXISTS public.crm_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contato_id UUID NOT NULL REFERENCES public.crm_contatos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'whatsapp' CHECK (tipo IN ('whatsapp', 'ligacao', 'reuniao', 'email', 'visita_clube', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_interacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  registrado_por UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Tarefas e Follow-ups
CREATE TABLE IF NOT EXISTS public.crm_tarefas_followup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contato_id UUID NOT NULL REFERENCES public.crm_contatos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'ligacao' CHECK (tipo IN ('ligacao', 'whatsapp', 'reuniao', 'email', 'tarefa')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  responsavel_id UUID,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.crm_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tarefas_followup ENABLE ROW LEVEL SECURITY;

-- Triggers de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_crm()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_updated_at_crm_contatos
  BEFORE UPDATE ON public.crm_contatos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_crm();

-- RLS Policies para crm_contatos
CREATE POLICY "Leitura de contatos crm por gestor" ON public.crm_contatos
  FOR SELECT USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Escrita de contatos crm por gestor" ON public.crm_contatos
  FOR ALL USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies para crm_interacoes
CREATE POLICY "Leitura de interacoes crm por gestor" ON public.crm_interacoes
  FOR SELECT USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Escrita de interacoes crm por gestor" ON public.crm_interacoes
  FOR ALL USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies para crm_tarefas_followup
CREATE POLICY "Leitura de tarefas crm por gestor" ON public.crm_tarefas_followup
  FOR SELECT USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Escrita de tarefas crm por gestor" ON public.crm_tarefas_followup
  FOR ALL USING (
    public.has_role(auth.uid(), 'gestor_crm') OR public.has_role(auth.uid(), 'gestor_admin') OR public.has_role(auth.uid(), 'admin')
  );

-- SEED DE DEMONSTRAÇÃO DO CRM (Contatos Exemplo para Distrito LC-11)
INSERT INTO public.crm_contatos (id, nome, email, telefone, whatsapp, clube_nome, cargo, tipo, estagio_funil, status, origem, observacoes, valor_estimado)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Dr. Roberto Mendes', 'roberto.mendes@email.com', '(27) 99881-2233', '(27) 99881-2233', 'Lions Clube Vitória Centro', 'Presidente de Clube', 'membro', 'filiado', 'convertido', 'Membro Ativo', 'Liderança ativa do distrito na Região A.', 360.00),
  ('11111111-1111-1111-1111-111111111102', 'Dra. Camila Vasconcelos', 'camila.v@medicina.org.br', '(27) 99772-4455', '(27) 99772-4455', 'Lions Clube Vila Velha Glória', 'Convidada / Médica', 'prospeccao', 'visita_realizada', 'em_andamento', 'Indicação da Governadoria', 'Participou da Reunião Festiva. Demonstrando interesse em saúde ocular.', 360.00),
  ('11111111-1111-1111-1111-111111111103', 'Empresa Siderúrgica Capixaba', 'contato@siderurgica.com.br', '(27) 3344-8800', '(27) 99988-1122', 'Parceiro Institucional', 'Patrocinador Master', 'doador_parceiro', 'proposta', 'em_andamento', 'Convenção Distrital', 'Proposta de patrocínio para a 26ª Convenção Distrital em análise.', 5000.00),
  ('11111111-1111-1111-1111-111111111104', 'Eng. Lucas Fonseca', 'lucas.fonseca@construtora.com', '(28) 99811-5566', '(28) 99811-5566', 'Lions Clube Cachoeiro', 'Empresário Convidado', 'prospeccao', 'convidado_reuniao', 'em_andamento', 'Site do Distrito', 'Aguardando confirmação para a reunião ordinária de quinta-feira.', 360.00),
  ('11111111-1111-1111-1111-111111111105', 'Prefeitura de Linhares (Sec. Saúde)', 'saude@linhares.es.gov.br', '(27) 3372-2000', '(27) 3372-2000', 'Órgão Público', 'Secretária de Saúde', 'autoridade', 'primeiro_contato', 'ativo', 'Parceria Global SightFirst', 'Reunião para alinhamento da Campanha de Prevenção ao Diabetes e Visão.', 0.00)
ON CONFLICT (id) DO NOTHING;

-- SEED DE TAREFAS E INTERAÇÕES
INSERT INTO public.crm_interacoes (contato_id, tipo, titulo, descricao)
VALUES
  ('11111111-1111-1111-1111-111111111102', 'reuniao', 'Participação na Reunião Festiva', 'Dra. Camila esteve presente na reunião festiva do clube. Gostou das ações de Visão.'),
  ('11111111-1111-1111-1111-111111111103', 'email', 'Envio de Proposta de Patrocínio', 'Minuta de contrato de patrocínio enviada para o departamento de marketing.'),
  ('11111111-1111-1111-1111-111111111104', 'whatsapp', 'Envio de Convite Oficial', 'Mensagem no WhatsApp com local e horário da próxima reunião de instrução leônica.');

INSERT INTO public.crm_tarefas_followup (contato_id, titulo, descricao, data_vencimento, tipo, status)
VALUES
  ('11111111-1111-1111-1111-111111111102', 'Ligar para Dra. Camila', 'Confirmar se recebeu a ficha de filiação ao Lions.', now() + interval '1 day', 'ligacao', 'pendente'),
  ('11111111-1111-1111-1111-111111111103', 'Follow-up do Patrocínio', 'Ligar para a assessoria de imprensa da Siderúrgica.', now() + interval '2 days', 'ligacao', 'pendente'),
  ('11111111-1111-1111-1111-111111111104', 'Confirmar Presença no Encontro', 'Verificar se Lucas precisa de carona/orientação de chegada.', now() + interval '3 hours', 'whatsapp', 'pendente');
