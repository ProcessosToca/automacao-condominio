# 🚨 SOLUÇÃO RÁPIDA - ERRO 404

## ❌ PROBLEMA
```
POST https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/update_user_profile 404 (Not Found)
```

## ✅ SOLUÇÃO IMEDIATA

### 1. Acesse o Supabase Dashboard
**Link direto**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg

### 2. Vá para SQL Editor
- Clique em "SQL Editor" no menu lateral
- Clique em "New query"

### 3. Cole e execute este código:

```sql
-- Adicionar coluna CPF
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Criar função update_user_profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id text,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_cpf text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_user record;
BEGIN
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  IF p_email != existing_user.email AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = p_email AND user_id::text != p_user_id
  ) THEN
    RETURN json_build_object('error', 'Este email já está sendo usado por outro usuário');
  END IF;

  UPDATE profiles 
  SET 
    full_name = p_full_name,
    email = p_email,
    phone = p_phone,
    cpf = p_cpf,
    updated_at = now()
  WHERE user_id::text = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', existing_user.user_id,
      'email', p_email,
      'full_name', p_full_name,
      'phone', p_phone,
      'cpf', p_cpf,
      'role', existing_user.role
    ),
    'message', 'Perfil atualizado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Criar função update_user_password_by_id
CREATE OR REPLACE FUNCTION public.update_user_password_by_id(
  p_user_id text,
  p_new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_user record;
BEGIN
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  UPDATE profiles 
  SET 
    password = p_new_password,
    updated_at = now()
  WHERE user_id::text = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Senha atualizada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
```

### 4. Clique em "Run" para executar

### 5. Recarregue a página da aplicação

## 🎯 RESULTADO
- ✅ Editar perfil funcionando
- ✅ Alterar senha funcionando
- ✅ Campo CPF disponível

## 🔄 PRÓXIMO PASSO
Depois de aplicar, teste as funcionalidades no Dashboard!
