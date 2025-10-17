-- Atualizar função handle_new_user para não usar email como full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_username text;
  user_full_name text;
BEGIN
  -- Gerar username único baseado no email
  user_username := generate_unique_username(NEW.email);
  
  -- Usar full_name dos metadados, ou extrair do email se não houver
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Se full_name estiver vazio ou for igual ao email, usar parte antes do @
  IF user_full_name IS NULL OR user_full_name = '' OR user_full_name = NEW.email THEN
    user_full_name := split_part(NEW.email, '@', 1);
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    user_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    user_username
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Atualizar perfis existentes que contêm @ no full_name (provavelmente são emails)
UPDATE public.profiles
SET full_name = split_part(
  (SELECT email FROM auth.users WHERE id = profiles.user_id),
  '@', 1
)
WHERE full_name LIKE '%@%';