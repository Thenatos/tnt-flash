-- Adicionar coluna parent_id para suportar respostas a comentários
ALTER TABLE public.comments
ADD COLUMN parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Criar índice para melhor performance nas consultas de respostas
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Comentário sobre a estrutura
COMMENT ON COLUMN public.comments.parent_id IS 'ID do comentário pai. NULL = comentário principal, não NULL = resposta a outro comentário';