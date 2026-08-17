-- ================================================================
-- Financeiro: Anexos + bucket de storage
-- ================================================================

-- Adicionar coluna de anexo nas contas a pagar e a receber
ALTER TABLE public.fin_contas_pagar  ADD COLUMN IF NOT EXISTS anexo_url text;
ALTER TABLE public.fin_contas_receber ADD COLUMN IF NOT EXISTS anexo_url text;

-- ── Storage bucket ────────────────────────────────────────────────
-- Cria o bucket para anexos financeiros (PDFs, imagens de comprovantes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fin-attachments',
  'fin-attachments',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ── Políticas de Storage ──────────────────────────────────────────
-- Leitura: qualquer usuário com acesso ao sistema de gestão
CREATE POLICY "gestao pode ler fin-attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'fin-attachments'
    AND public.has_gestao_access(auth.uid())
  );

-- Upload: somente gestores financeiros
CREATE POLICY "gestor financeiro pode fazer upload fin-attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fin-attachments'
    AND public.has_gestao_financeiro(auth.uid())
  );

-- Update (substituir arquivo): somente gestores financeiros
CREATE POLICY "gestor financeiro pode atualizar fin-attachments"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'fin-attachments'
    AND public.has_gestao_financeiro(auth.uid())
  );

-- Delete: somente gestores financeiros
CREATE POLICY "gestor financeiro pode deletar fin-attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fin-attachments'
    AND public.has_gestao_financeiro(auth.uid())
  );
