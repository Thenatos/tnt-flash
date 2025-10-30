-- Adicionar política para admin deletar denúncias
CREATE POLICY "Admin pode deletar denúncias"
ON public.comment_reports
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Atualizar política SELECT de denúncias para ser mais clara
DROP POLICY IF EXISTS "Admin pode ver denúncias" ON public.comment_reports;

CREATE POLICY "Admin pode ver denúncias"
ON public.comment_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));