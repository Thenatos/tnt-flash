-- Criar tabela de preferências de email
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receive_alerts boolean NOT NULL DEFAULT true,
  receive_promotions boolean NOT NULL DEFAULT true,
  receive_mass_emails boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias preferências"
ON public.email_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas preferências"
ON public.email_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas preferências"
ON public.email_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_email_preferences_updated_at
BEFORE UPDATE ON public.email_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Criar preferências padrão para usuários existentes
INSERT INTO public.email_preferences (user_id, receive_alerts, receive_promotions, receive_mass_emails)
SELECT id, true, true, true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;