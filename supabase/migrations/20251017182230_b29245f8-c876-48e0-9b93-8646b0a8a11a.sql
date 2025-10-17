-- Adicionar campo online_at para rastrear presença
ALTER TABLE public.profiles
ADD COLUMN online_at timestamp with time zone;

-- Criar índice para consultas de presença
CREATE INDEX idx_profiles_online_at ON public.profiles(online_at);

-- Atualizar política para permitir usuários atualizarem seu próprio online_at
-- (já existe política de UPDATE para próprio perfil)