-- Adicionar permissão para Links Comissionados na tabela admin_permissions
ALTER TABLE public.admin_permissions
ADD COLUMN can_view_commissioned_links BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN can_create_commissioned_links BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN can_edit_commissioned_links BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN can_delete_commissioned_links BOOLEAN NOT NULL DEFAULT false;

-- Atualizar permissões existentes para incluir acesso total aos Links Comissionados
UPDATE public.admin_permissions
SET 
  can_view_commissioned_links = true,
  can_create_commissioned_links = true,
  can_edit_commissioned_links = true,
  can_delete_commissioned_links = true
WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
);
