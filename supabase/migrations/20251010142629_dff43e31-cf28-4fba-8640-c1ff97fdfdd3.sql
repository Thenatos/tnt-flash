-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao bucket
CREATE POLICY "Todos podem ver imagens de produtos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admin pode fazer upload de imagens"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin pode deletar imagens"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  public.has_role(auth.uid(), 'admin')
);