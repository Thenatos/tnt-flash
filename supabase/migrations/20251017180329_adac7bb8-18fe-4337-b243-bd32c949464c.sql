-- Corrigir função generate_unique_username com search_path
CREATE OR REPLACE FUNCTION public.generate_unique_username(email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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