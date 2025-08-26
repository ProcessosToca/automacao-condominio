-- =====================================================
-- FUNÇÃO ULTRA SIMPLES PARA GERAR SENHA ALEATÓRIA
-- =====================================================

-- Função para gerar senha aleatória (ULTRA SIMPLES)
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
  -- Gerar senha simples sem embaralhamento complexo
  FOR i IN 1..length LOOP
    rand := (floor(random() * length(chars)) + 1)::integer;
    result := result || substr(chars, rand, 1);
  END LOOP;
  
  RETURN result;
END;
$$;

-- Função para gerar nova senha e atualizar no banco
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
-- 6. Teste a funcionalidade "Esqueci minha senha"
-- =====================================================
