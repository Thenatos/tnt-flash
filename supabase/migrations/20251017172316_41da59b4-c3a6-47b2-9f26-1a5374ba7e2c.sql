-- Criar tabela de reações de produtos
CREATE TABLE IF NOT EXISTS public.product_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.product_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ver reações
CREATE POLICY "Todos podem ver reações"
  ON public.product_reactions
  FOR SELECT
  USING (true);

-- Políticas: Usuários autenticados podem criar reações
CREATE POLICY "Usuários podem criar reações"
  ON public.product_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas: Usuários podem atualizar suas próprias reações
CREATE POLICY "Usuários podem atualizar suas reações"
  ON public.product_reactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas: Usuários podem deletar suas próprias reações
CREATE POLICY "Usuários podem deletar suas reações"
  ON public.product_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_product_reactions_product_id ON public.product_reactions(product_id);
CREATE INDEX idx_product_reactions_user_id ON public.product_reactions(user_id);