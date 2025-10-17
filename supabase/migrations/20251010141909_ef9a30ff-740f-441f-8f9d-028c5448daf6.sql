-- Criar função de segurança para verificar roles sem recursão
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Remover políticas antigas da tabela user_roles
DROP POLICY IF EXISTS "Admin pode ver todas as roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin pode inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin pode deletar roles" ON public.user_roles;

-- Criar novas políticas usando a função de segurança
CREATE POLICY "Admin pode ver todas as roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode inserir roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Atualizar políticas das outras tabelas para usar a função
DROP POLICY IF EXISTS "Admin pode inserir categorias" ON public.categories;
DROP POLICY IF EXISTS "Admin pode atualizar categorias" ON public.categories;
DROP POLICY IF EXISTS "Admin pode deletar categorias" ON public.categories;

CREATE POLICY "Admin pode inserir categorias"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar categorias"
ON public.categories
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar categorias"
ON public.categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Produtos
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON public.products;
DROP POLICY IF EXISTS "Admin pode atualizar produtos" ON public.products;
DROP POLICY IF EXISTS "Admin pode deletar produtos" ON public.products;

CREATE POLICY "Admin pode inserir produtos"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar produtos"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar produtos"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Lojas
DROP POLICY IF EXISTS "Admin pode inserir lojas" ON public.stores;
DROP POLICY IF EXISTS "Admin pode atualizar lojas" ON public.stores;
DROP POLICY IF EXISTS "Admin pode deletar lojas" ON public.stores;

CREATE POLICY "Admin pode inserir lojas"
ON public.stores
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode atualizar lojas"
ON public.stores
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin pode deletar lojas"
ON public.stores
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Comentários
DROP POLICY IF EXISTS "Admin pode deletar qualquer comentário" ON public.comments;

CREATE POLICY "Admin pode deletar qualquer comentário"
ON public.comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));