-- =====================================================
-- MIGRAÇÃO PARA FUNCIONALIDADE DE RESET DE SENHA
-- =====================================================

-- 1. Função para gerar senha aleatória
CREATE OR REPLACE FUNCTION public.generate_random_password(length integer DEFAULT 10)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  result text := '';
  i integer := 0;
  rand integer;
BEGIN
  -- Garantir pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo
  result := substr(chars, floor(random() * 26) + 1, 1); -- Letra maiúscula
  result := result || substr(chars, floor(random() * 26) + 27, 1); -- Letra minúscula
  result := result || substr(chars, floor(random() * 10) + 53, 1); -- Número
  result := result || substr(chars, floor(random() * 8) + 63, 1); -- Símbolo
  
  -- Completar o resto da senha
  FOR i IN 5..length LOOP
    rand := floor(random() * length(chars)) + 1;
    result := result || substr(chars, rand, 1);
  END LOOP;
  
  -- Embaralhar a senha
  result := string_agg(substr(result, generate_series(1, length(result)), 1), '' ORDER BY random());
  
  RETURN result;
END;
$$;

-- 2. Função para gerar nova senha e atualizar no banco
CREATE OR REPLACE FUNCTION public.generate_and_update_password(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
  new_password text;
BEGIN
  -- Verificar se o usuário existe
  SELECT * INTO user_record
  FROM profiles 
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado ou inativo');
  END IF;

  -- Gerar nova senha
  new_password := public.generate_random_password(10);
  
  -- Atualizar senha no banco
  UPDATE profiles 
  SET 
    password = new_password,
    updated_at = now()
  WHERE email = p_email;
  
  -- Retornar sucesso com a nova senha
  RETURN json_build_object(
    'success', true,
    'new_password', new_password,
    'message', 'Nova senha gerada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- =====================================================
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
-- 2. Vá para SQL Editor
-- 3. Clique em "New query"
-- 4. Cole todo este código
-- 5. Clique em "Run"
-- 6. Deploy a Edge Function send-password-reset
-- 7. Teste a funcionalidade "Esqueci minha senha"
-- =====================================================
