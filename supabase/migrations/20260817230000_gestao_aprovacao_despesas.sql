-- ================================================================
-- Módulo de Aprovação de Despesas pela Governadoria
-- ================================================================

-- 1. Estender a tabela de contas a pagar com campos de fluxo de aprovação
ALTER TABLE public.fin_contas_pagar 
  ADD COLUMN IF NOT EXISTS status_aprovacao text NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado', 'revisao')),
  ADD COLUMN IF NOT EXISTS aprovado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS aprovado_em timestamptz,
  ADD COLUMN IF NOT EXISTS parecer_governador text,
  ADD COLUMN IF NOT EXISTS solicitante_nome text DEFAULT 'Tesouraria Distrital';

-- 2. Tabela de Histórico de Aprovações e Pareceres da Governadoria
CREATE TABLE IF NOT EXISTS public.fin_historico_aprovacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_pagar_id uuid NOT NULL REFERENCES public.fin_contas_pagar(id) ON DELETE CASCADE,
  acao text NOT NULL CHECK (acao IN ('solicitado', 'aprovado', 'rejeitado', 'solicitado_revisao')),
  parecer text,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  usuario_nome text NOT NULL,
  cargo_usuario text NOT NULL DEFAULT 'Governador(a) de Distrito',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fin_historico_aprovacoes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fin_historico_aprovacoes TO authenticated;
GRANT ALL ON public.fin_historico_aprovacoes TO service_role;

CREATE POLICY "leitura historico aprovacoes por gestao" ON public.fin_historico_aprovacoes
  FOR SELECT USING (public.has_gestao_access(auth.uid()));

CREATE POLICY "escrita historico aprovacoes por admin e financeiro" ON public.fin_historico_aprovacoes
  FOR ALL USING (public.has_gestao_access(auth.uid()));

-- SEED DE DEMONSTRAÇÃO DE DESPESAS PENDENTES DE APROVAÇÃO
INSERT INTO public.fin_contas_pagar (id, descricao, valor, vencimento, status, status_aprovacao, fornecedor, documento, observacoes, solicitante_nome, anexo_url)
VALUES
  ('a1111111-1111-1111-1111-111111111101', 'Aluguel do Centro de Convenções - 1ª Convenção Distrital', 350000, '2026-09-10', 'pendente', 'pendente', 'Centro de Convenções de Vitória', 'NF-99881', 'Pagamento da 1ª parcela do aluguel da sede do evento distrital.', 'CL João Paulo (Tesoureiro Distrital)', '/docs/comprovante_aluguel.pdf'),
  ('a1111111-1111-1111-1111-111111111102', 'Confecção de Estandartes e Pins Oficiais AL 2025/2026', 185000, '2026-08-30', 'pendente', 'pendente', 'Gráfica & Comendas ES', 'NF-44120', 'Confecção dos kits oficiais da Governadoria para entrega aos clubes.', 'CL João Paulo (Tesoureiro Distrital)', '/docs/orcamento_pins.pdf'),
  ('a1111111-1111-1111-1111-111111111103', 'Reembolso de Deslocamento Visita Oficial Região C', 42000, '2026-08-25', 'pendente', 'pendente', 'CL Dr. Roberto Mendes', 'REC-0012', 'Despesas com combustível e hospedagem na visita aos clubes do sul.', 'CL Dr. Roberto Mendes (1º Vice-Governador)', NULL),
  ('a1111111-1111-1111-1111-111111111104', 'Manutenção e Hospedagem do Site Hub LC-11 (Servidor)', 6500, '2026-08-20', 'pago', 'aprovado', 'Vercel / Cloud Infrastructure', 'FAT-8871', 'Mensalidade do servidor e infraestrutura do portal distrital.', 'CL João Paulo (Tesoureiro Distrital)', NULL)
ON CONFLICT (id) DO NOTHING;
