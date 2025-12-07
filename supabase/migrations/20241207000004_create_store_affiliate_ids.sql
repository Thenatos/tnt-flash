-- Criar tabela para armazenar múltiplos IDs de afiliado por loja
CREATE TABLE public.store_affiliate_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  affiliate_id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Garantir que não haja IDs duplicados para a mesma loja
  UNIQUE(store_id, affiliate_id)
);

-- Criar índices para melhor performance
CREATE INDEX idx_store_affiliate_ids_store ON public.store_affiliate_ids(store_id);
CREATE INDEX idx_store_affiliate_ids_active ON public.store_affiliate_ids(is_active);

-- Habilitar RLS
ALTER TABLE public.store_affiliate_ids ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Todos podem ver IDs ativos (para validação)
CREATE POLICY "Todos podem ver affiliate IDs ativos"
ON public.store_affiliate_ids
FOR SELECT
USING (is_active = true);

-- Apenas admins podem gerenciar
CREATE POLICY "Admins podem gerenciar affiliate IDs"
ON public.store_affiliate_ids
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_store_affiliate_ids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_store_affiliate_ids_updated_at
  BEFORE UPDATE ON public.store_affiliate_ids
  FOR EACH ROW
  EXECUTE FUNCTION update_store_affiliate_ids_updated_at();

-- Função para validar se um link contém algum affiliate ID válido da loja
CREATE OR REPLACE FUNCTION validate_affiliate_link(
  p_store_id UUID,
  p_link TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  affiliate_record RECORD;
  link_lower TEXT;
BEGIN
  -- Converter link para lowercase para comparação case-insensitive
  link_lower := LOWER(p_link);
  
  -- Buscar todos os affiliate IDs ativos da loja
  FOR affiliate_record IN 
    SELECT affiliate_id 
    FROM public.store_affiliate_ids 
    WHERE store_id = p_store_id 
    AND is_active = true
  LOOP
    -- Verificar se o link contém o affiliate ID
    IF link_lower LIKE '%' || LOWER(affiliate_record.affiliate_id) || '%' THEN
      RETURN true;
    END IF;
  END LOOP;
  
  -- Se não encontrou nenhum ID, verificar se a loja tem IDs cadastrados
  -- Se não tiver, permitir (backward compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM public.store_affiliate_ids 
    WHERE store_id = p_store_id 
    AND is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
