-- Adicionar política para usuários anônimos verem perfis (username, avatar, full_name)
-- Isso permite que comentários mostrem informações do usuário mesmo sem estar logado

-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "Authenticated users see limited profiles" ON public.profiles;

-- Adicionar política para usuários anônimos e autenticados verem perfis públicos
CREATE POLICY "Public can see profile info for comments"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Manter política de usuários ver/editar o próprio perfil
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users see limited profiles" ON public.profiles;

-- Usuários autenticados podem ver seu próprio perfil completo
CREATE POLICY "Authenticated users see full profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários autenticados podem ver perfis limitados de outros
CREATE POLICY "Authenticated users see others profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() != user_id);
