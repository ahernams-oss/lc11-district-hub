CREATE TABLE public.fin_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  nome_fantasia text,
  tipo_pessoa text NOT NULL DEFAULT 'juridica',
  documento text,
  email text,
  telefone text,
  whatsapp text,
  contato_nome text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado_uf text,
  categoria_id uuid REFERENCES public.fin_categorias(id) ON DELETE SET NULL,
  clube_nome text,
  observacoes text,
  ativo boolean NOT NULL DEFAULT true,
  distrito_id uuid REFERENCES public.distritos(id),
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.fin_clientes TO authenticated;
GRANT ALL ON public.fin_clientes TO service_role;

ALTER TABLE public.fin_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Painel pode consultar clientes"
  ON public.fin_clientes FOR SELECT TO authenticated
  USING (public.has_panel_access(auth.uid()));

CREATE TRIGGER fin_clientes_touch BEFORE UPDATE ON public.fin_clientes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX fin_clientes_busca_idx ON public.fin_clientes
  USING gin (to_tsvector('portuguese', coalesce(nome,'') || ' ' || coalesce(nome_fantasia,'') || ' ' || coalesce(documento,'')));

CREATE INDEX fin_clientes_nome_idx ON public.fin_clientes (lower(nome));

ALTER TABLE public.fin_contas_receber
  ADD COLUMN cliente_id uuid REFERENCES public.fin_clientes(id) ON DELETE SET NULL;
