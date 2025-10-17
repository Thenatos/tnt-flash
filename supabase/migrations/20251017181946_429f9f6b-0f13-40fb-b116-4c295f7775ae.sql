-- Criar tabela de reações de comentários
CREATE TABLE public.comment_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem ver reações de comentários"
ON public.comment_reactions
FOR SELECT
USING (true);

CREATE POLICY "Usuários podem criar reações"
ON public.comment_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas reações"
ON public.comment_reactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas reações"
ON public.comment_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON public.comment_reactions(user_id);