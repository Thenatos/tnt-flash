-- Adicionar campo de status às denúncias
ALTER TABLE public.comment_reports 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Criar índice para melhor performance
CREATE INDEX idx_comment_reports_status ON public.comment_reports(status);

-- Adicionar campo de verificação (quando foi verificada)
ALTER TABLE public.comment_reports 
ADD COLUMN verified_at timestamp with time zone,
ADD COLUMN verified_by uuid REFERENCES auth.users(id);

-- Comentário explicativo
COMMENT ON COLUMN public.comment_reports.status IS 'Status da denúncia: pending, resolved, dismissed';