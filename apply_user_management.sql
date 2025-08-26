-- Aplicar funções de gerenciamento de usuários
-- Execute este script no Supabase SQL Editor

-- Função para buscar todos os usuários (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
  END IF;

  -- Retornar todos os usuários
  RETURN json_build_object(
    'success', true,
    'users', (
      SELECT json_agg(
        json_build_object(
          'id', p.user_id,
          'email', p.email,
          'full_name', p.full_name,
          'phone', p.phone,
          'cpf', p.cpf,
          'role', p.role,
          'is_active', p.is_active,
          'created_at', p.created_at
        )
      )
      FROM profiles p
      WHERE p.is_active = true
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Função para buscar usuário por ID
CREATE OR REPLACE FUNCTION public.get_user_by_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
  END IF;

  -- Buscar usuário
  SELECT * INTO user_record
  FROM profiles
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', user_record.user_id,
      'email', user_record.email,
      'full_name', user_record.full_name,
      'phone', user_record.phone,
      'cpf', user_record.cpf,
      'role', user_record.role,
      'is_active', user_record.is_active,
      'created_at', user_record.created_at
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Função para atualizar usuário por admin
CREATE OR REPLACE FUNCTION public.update_user_by_admin(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT null,
  p_cpf text DEFAULT null
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user record;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acesso negado. Apenas administradores podem editar usuários.');
  END IF;

  -- Buscar usuário alvo
  SELECT * INTO target_user
  FROM profiles
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  -- Verificar se o usuário alvo é admin (não permitir editar admins)
  IF target_user.role = 'admin' THEN
    RETURN json_build_object('error', 'Não é possível editar outros administradores.');
  END IF;

  -- Verificar se o email já existe (se for diferente do atual)
  IF p_email != target_user.email AND EXISTS (
    SELECT 1 FROM profiles WHERE email = p_email AND user_id != p_user_id
  ) THEN
    RETURN json_build_object('error', 'Email já está em uso por outro usuário.');
  END IF;

  -- Atualizar usuário
  UPDATE profiles
  SET 
    full_name = p_full_name,
    email = p_email,
    phone = p_phone,
    cpf = p_cpf,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Usuário atualizado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
