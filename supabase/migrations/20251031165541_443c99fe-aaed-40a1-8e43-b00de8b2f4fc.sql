-- Adicionar política RLS para permitir que admins atualizem denúncias
CREATE POLICY "Admin pode atualizar denúncias"
ON comment_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));