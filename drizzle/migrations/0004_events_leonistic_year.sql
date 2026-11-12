ALTER TABLE public.events ADD COLUMN ano_leonistico text NOT NULL DEFAULT '2026/2027';
COMMENT ON COLUMN public.events.ano_leonistico IS 'Ano leonístico escolhido no cadastro, independente da data do evento. Eventos existentes atribuídos a 2026/2027.';
CREATE INDEX events_ano_leonistico_idx ON public.events (ano_leonistico);