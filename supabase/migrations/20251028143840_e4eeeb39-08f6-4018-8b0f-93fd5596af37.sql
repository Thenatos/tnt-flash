-- Criar tabela de denúncias de comentários
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'offensive', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, reported_by)
);

-- Habilitar RLS
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para denúncias
CREATE POLICY "Usuários podem criar denúncias"
ON public.comment_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admin pode ver denúncias"
ON public.comment_reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Criar tabela de punições de usuários
CREATE TABLE public.user_punishments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  punishment_type TEXT NOT NULL CHECK (punishment_type IN ('comment_ban', 'site_ban', 'temporary_ban')),
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_punishments ENABLE ROW LEVEL SECURITY;

-- Políticas para punições
CREATE POLICY "Admin pode gerenciar punições"
ON public.user_punishments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Função para verificar se usuário pode comentar
CREATE OR REPLACE FUNCTION public.can_user_comment(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar ban de comentários
  IF EXISTS (
    SELECT 1 FROM public.user_punishments
    WHERE user_id = user_uuid
    AND punishment_type IN ('comment_ban', 'site_ban')
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN
    RETURN false;
  END IF;
  
  -- Verificar ban temporário
  IF EXISTS (
    SELECT 1 FROM public.user_punishments
    WHERE user_id = user_uuid
    AND punishment_type = 'temporary_ban'
    AND is_active = true
    AND expires_at > now()
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Atualizar política de INSERT de comentários para verificar punições
DROP POLICY IF EXISTS "Usuários autenticados podem criar comentários" ON public.comments;

CREATE POLICY "Usuários não punidos podem criar comentários"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.can_user_comment(auth.uid()));

-- Trigger para desativar punições expiradas
CREATE OR REPLACE FUNCTION public.deactivate_expired_punishments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_punishments
  SET is_active = false
  WHERE expires_at IS NOT NULL 
  AND expires_at <= now() 
  AND is_active = true;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_expired_punishments
BEFORE INSERT ON public.user_punishments
FOR EACH STATEMENT
EXECUTE FUNCTION public.deactivate_expired_punishments();