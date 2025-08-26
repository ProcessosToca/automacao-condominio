-- =====================================================
-- ATUALIZAR FUNÇÃO DE RESET DE SENHA
-- Sistema: Inteliscribe Engine
-- Data: 2024
-- =====================================================

-- Função para gerar senha aleatória (já existe, mas vamos garantir)
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

-- Função atualizada para gerar nova senha e atualizar no banco
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
  
  -- Configurar variável para o template de email (se necessário)
  PERFORM set_config('app.new_password', new_password, false);
  
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

-- Função para atualizar senha do usuário (já existe, mas vamos garantir)
CREATE OR REPLACE FUNCTION public.update_user_password(
  user_id_param text,
  password_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Verificar se o usuário existe
  SELECT * INTO user_record
  FROM profiles 
  WHERE email = user_id_param AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado ou inativo');
  END IF;

  -- Atualizar senha
  UPDATE profiles 
  SET 
    password = password_param,
    updated_at = now()
  WHERE email = user_id_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Senha atualizada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- =====================================================
-- VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- =====================================================

-- Verificar se as funções existem
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname IN ('generate_random_password', 'generate_and_update_password', 'update_user_password')
ORDER BY proname;

-- =====================================================
-- TESTAR AS FUNÇÕES
-- =====================================================

-- Testar geração de senha aleatória
SELECT public.generate_random_password(10) as nova_senha;

-- Testar função de reset (substitua pelo email real)
-- SELECT public.generate_and_update_password('teste@exemplo.com');

-- =====================================================
-- INSTRUÇÕES PARA CONFIGURAR O TEMPLATE DE EMAIL
-- =====================================================

/*
1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Vá para Authentication > Emails > Templates
3. Selecione "Reset Password"
4. Substitua o HTML pelo template fornecido no arquivo CONFIGURAR_TEMPLATE_EMAIL_SUPABASE.md
5. Salve as alterações
6. Teste a funcionalidade "Esqueci minha senha"
*/

-- =====================================================
-- DEPLOY DA EDGE FUNCTION
-- =====================================================

/*
Execute no terminal:
npx supabase functions deploy send-password-reset
*/

-- =====================================================
-- CONFIGURAÇÃO OPCIONAL: SENDGRID
-- =====================================================

/*
Para usar SendGrid para envio de emails:

1. Crie conta no SendGrid: https://sendgrid.com/
2. Obtenha API Key
3. Configure no Supabase:
   npx supabase secrets set SENDGRID_API_KEY=sua_api_key_aqui
4. Deploy da Edge Function novamente
*/

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
Após a configuração:
✅ Nova senha gerada automaticamente
✅ Email enviado com template profissional
✅ Senha exibida no email
✅ Usuário pode fazer login imediatamente
✅ Sistema funcionando em modo simulação (sem SendGrid)
*/

