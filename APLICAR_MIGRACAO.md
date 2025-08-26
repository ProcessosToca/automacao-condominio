# 🚀 APLICAR MIGRAÇÃO URGENTE

## ❌ ERRO ATUAL
```
POST https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/update_user_profile 404 (Not Found)
```

## ✅ SOLUÇÃO

### Opção 1: Via Dashboard do Supabase (MAIS RÁPIDA)

1. **Acesse**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. **Vá para**: SQL Editor
3. **Cole este código** e execute:

```sql
-- Add CPF column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create function to update user profile
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
  -- Check if user exists
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  -- Check if new email is already in use by another user
  IF p_email != existing_user.email AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = p_email AND user_id::text != p_user_id
  ) THEN
    RETURN json_build_object('error', 'Este email já está sendo usado por outro usuário');
  END IF;

  -- Update user profile
  UPDATE profiles 
  SET 
    full_name = p_full_name,
    email = p_email,
    phone = p_phone,
    cpf = p_cpf,
    updated_at = now()
  WHERE user_id::text = p_user_id;
  
  -- Return success with updated user data
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

-- Create function to update user password by user_id
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
  -- Check if user exists
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  -- Update password
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

### Opção 2: Via CLI (se configurado)

```bash
npx supabase link --project-ref jamzaegwhzmtvierjckg
npx supabase db push
```

## 🎯 RESULTADO ESPERADO

Após aplicar a migração:
- ✅ Função `update_user_profile` criada
- ✅ Função `update_user_password_by_id` criada  
- ✅ Coluna `cpf` adicionada à tabela `profiles`
- ✅ Editar perfil funcionando
- ✅ Alterar senha funcionando

## 🔄 PRÓXIMO PASSO

Depois de aplicar a migração, recarregue a página e teste as funcionalidades!
