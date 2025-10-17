-- Adicionar coluna username à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE;

-- Criar índice para username
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Função para gerar username único baseado no email
CREATE OR REPLACE FUNCTION public.generate_unique_username(email text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  -- Extrair parte antes do @ do email e limpar caracteres especiais
  base_username := lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]', '', 'g'));
  
  -- Limitar tamanho do username
  base_username := substring(base_username from 1 for 20);
  
  final_username := base_username;
  
  -- Verificar se username já existe, se sim adicionar número
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::text;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Atualizar função handle_new_user para incluir username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_username text;
BEGIN
  -- Gerar username único baseado no email
  user_username := generate_unique_username(NEW.email);
  
  INSERT INTO public.profiles (user_id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    user_username
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Atualizar perfis existentes com username
DO $$
DECLARE
  profile_record RECORD;
  new_username text;
BEGIN
  FOR profile_record IN 
    SELECT user_id, full_name 
    FROM public.profiles 
    WHERE username IS NULL
  LOOP
    -- Gerar username baseado no full_name ou criar genérico
    IF profile_record.full_name IS NOT NULL THEN
      new_username := generate_unique_username(profile_record.full_name);
    ELSE
      new_username := 'user_' || substring(profile_record.user_id::text from 1 for 8);
    END IF;
    
    UPDATE public.profiles 
    SET username = new_username 
    WHERE user_id = profile_record.user_id;
  END LOOP;
END;
$$;