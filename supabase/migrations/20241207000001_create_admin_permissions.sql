-- Criar tabela para permissões administrativas granulares
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Permissões de visualização de abas
  can_view_products BOOLEAN NOT NULL DEFAULT true,
  can_view_banners BOOLEAN NOT NULL DEFAULT true,
  can_view_alert_suggestions BOOLEAN NOT NULL DEFAULT true,
  can_view_analytics BOOLEAN NOT NULL DEFAULT true,
  can_view_mass_email BOOLEAN NOT NULL DEFAULT true,
  can_view_user_management BOOLEAN NOT NULL DEFAULT true,
  can_view_access_management BOOLEAN NOT NULL DEFAULT false,
  
  -- Permissões CRUD para Produtos
  can_create_products BOOLEAN NOT NULL DEFAULT true,
  can_edit_products BOOLEAN NOT NULL DEFAULT true,
  can_delete_products BOOLEAN NOT NULL DEFAULT false,
  
  -- Permissões CRUD para Banners
  can_create_banners BOOLEAN NOT NULL DEFAULT true,
  can_edit_banners BOOLEAN NOT NULL DEFAULT true,
  can_delete_banners BOOLEAN NOT NULL DEFAULT false,
  
  -- Permissões CRUD para Sugestões de Alertas
  can_create_alert_suggestions BOOLEAN NOT NULL DEFAULT true,
  can_edit_alert_suggestions BOOLEAN NOT NULL DEFAULT true,
  can_delete_alert_suggestions BOOLEAN NOT NULL DEFAULT false,
  
  -- Permissões para Email em Massa
  can_send_mass_email BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Criar índice para melhor performance
CREATE INDEX idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- Habilitar RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Admins podem ver suas próprias permissões
CREATE POLICY "Admin pode ver suas próprias permissões"
ON public.admin_permissions
FOR SELECT
USING (
  user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Apenas admins com permissão de gestão de acessos podem gerenciar permissões
CREATE POLICY "Admin com permissão pode gerenciar acessos"
ON public.admin_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    LEFT JOIN public.admin_permissions ap ON ap.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
    AND (ap.can_view_access_management = true OR ap.id IS NULL)
  )
);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_admin_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_permissions_updated_at();

-- Inserir permissões padrão para admins existentes (permissões completas)
INSERT INTO public.admin_permissions (
  user_id,
  can_view_products,
  can_view_banners,
  can_view_alert_suggestions,
  can_view_analytics,
  can_view_mass_email,
  can_view_user_management,
  can_view_access_management,
  can_create_products,
  can_edit_products,
  can_delete_products,
  can_create_banners,
  can_edit_banners,
  can_delete_banners,
  can_create_alert_suggestions,
  can_edit_alert_suggestions,
  can_delete_alert_suggestions,
  can_send_mass_email
)
SELECT 
  user_id,
  true, true, true, true, true, true, true,
  true, true, true,
  true, true, true,
  true, true, true,
  true
FROM public.user_roles
WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;
