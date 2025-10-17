-- Criar bucket para imagens de banners (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para o bucket de banners
CREATE POLICY "Todos podem ver imagens de banners"
ON storage.objects
FOR SELECT
USING (bucket_id = 'banner-images');

CREATE POLICY "Admin pode fazer upload de imagens de banners"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'banner-images' AND 
  has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admin pode atualizar imagens de banners"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'banner-images' AND 
  has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Admin pode deletar imagens de banners"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'banner-images' AND 
  has_role(auth.uid(), 'admin'::user_role)
);