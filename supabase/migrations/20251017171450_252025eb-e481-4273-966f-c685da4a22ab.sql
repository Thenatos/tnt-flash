-- Criar tabela de sugestões de alertas
CREATE TABLE IF NOT EXISTS public.alert_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.alert_suggestions ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ver sugestões ativas
CREATE POLICY "Todos podem ver sugestões ativas"
  ON public.alert_suggestions
  FOR SELECT
  USING (is_active = true);

-- Políticas: Admin pode gerenciar
CREATE POLICY "Admin pode inserir sugestões"
  ON public.alert_suggestions
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin pode atualizar sugestões"
  ON public.alert_suggestions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin pode deletar sugestões"
  ON public.alert_suggestions
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_alert_suggestions_updated_at
  BEFORE UPDATE ON public.alert_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir algumas sugestões padrão
INSERT INTO public.alert_suggestions (term, display_order) VALUES
  ('Smartphone Samsung', 1),
  ('iPhone', 2),
  ('Notebook', 3),
  ('SSD', 4),
  ('Fone Bluetooth', 5),
  ('Smart TV', 6);