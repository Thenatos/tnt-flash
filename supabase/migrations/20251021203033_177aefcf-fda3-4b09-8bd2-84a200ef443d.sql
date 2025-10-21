-- Criar tabela de eventos de analytics
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_path text,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_product_id ON public.analytics_events(product_id);
CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin pode ver todos os eventos"
  ON public.analytics_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Todos podem inserir eventos"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);