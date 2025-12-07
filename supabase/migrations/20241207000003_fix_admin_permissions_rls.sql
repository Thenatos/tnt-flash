-- Remover políticas antigas
DROP POLICY IF EXISTS "Admin pode ver suas próprias permissões" ON public.admin_permissions;
DROP POLICY IF EXISTS "Admin com permissão pode gerenciar acessos" ON public.admin_permissions;

-- Política mais simples: qualquer admin pode ver permissões de outros admins
CREATE POLICY "Admins podem ver permissões"
ON public.admin_permissions
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política para INSERT: apenas admins podem inserir
CREATE POLICY "Admins podem criar permissões"
ON public.admin_permissions
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política para UPDATE: apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar permissões"
ON public.admin_permissions
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Política para DELETE: apenas admins podem deletar
CREATE POLICY "Admins podem deletar permissões"
ON public.admin_permissions
FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
