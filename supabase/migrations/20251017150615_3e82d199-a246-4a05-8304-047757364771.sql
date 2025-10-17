-- Criar tabela para banners do carrossel
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Todos podem ver banners ativos"
ON public.hero_banners
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin pode inserir banners"
ON public.hero_banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin pode atualizar banners"
ON public.hero_banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admin pode deletar banners"
ON public.hero_banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::user_role));

-- Trigger para updated_at
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Inserir banner padrão
INSERT INTO public.hero_banners (title, subtitle, image_url, display_order)
VALUES 
  ('OFERTAS EXPLOSIVAS', 'As melhores promoções do Brasil em um só lugar!', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80', 1);