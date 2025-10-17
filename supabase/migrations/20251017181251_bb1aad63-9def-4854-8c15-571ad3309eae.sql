-- Criar tabela de notificações
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias notificações"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar notificações"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Criar índice para melhor performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);