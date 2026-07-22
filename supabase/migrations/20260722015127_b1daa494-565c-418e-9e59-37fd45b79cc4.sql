
-- Tighten permissive RLS policies

-- document_audit_logs: only allow authenticated users to insert their own audit log rows
DROP POLICY IF EXISTS "Inserção por usuários autenticados" ON public.document_audit_logs;
CREATE POLICY "Inserção por usuários autenticados"
  ON public.document_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- donations: drop redundant service_role policy (service_role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role manages donations" ON public.donations;
