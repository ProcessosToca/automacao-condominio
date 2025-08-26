# Aplicar Solução Completa - Estatísticas do Administrador

## Problema
```
POST https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/get_admin_stats 404 (Not Found)
```

## Solução Completa

### 1. Execute o Script SQL Completo

**Copie e cole este script no Supabase SQL Editor:**

```sql
-- SOLUÇÃO COMPLETA PARA ESTATÍSTICAS DO ADMINISTRADOR
-- Execute este script completo no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se a tabela profiles existe e tem dados
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios_comuns
FROM profiles 
WHERE is_active = true;

-- 2. Criar função is_admin se não existir
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Criar função get_all_users se não existir
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- 4. Criar função get_user_by_id se não existir
CREATE OR REPLACE FUNCTION public.get_user_by_id(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
BEGIN
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

-- 5. Criar função update_user_by_admin se não existir
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
  SELECT * INTO target_user
  FROM profiles
  WHERE user_id = p_user_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  IF target_user.role = 'admin' THEN
    RETURN json_build_object('error', 'Não é possível editar outros administradores.');
  END IF;

  IF p_email != target_user.email AND EXISTS (
    SELECT 1 FROM profiles WHERE email = p_email AND user_id != p_user_id
  ) THEN
    RETURN json_build_object('error', 'Email já está em uso por outro usuário.');
  END IF;

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

-- 6. Criar função get_admin_stats (PRINCIPAL)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN json_build_object(
    'success', true,
    'stats', (
      SELECT json_build_object(
        'active_users', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true
        ),
        'new_users', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true 
          AND created_at >= now() - interval '30 days'
        ),
        'reports', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true
        )
      )
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- 7. Verificar se todas as funções foram criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_admin_stats', 'get_all_users', 'get_user_by_id', 'update_user_by_admin', 'is_admin')
ORDER BY routine_name;

-- 8. Testar a função principal
SELECT public.get_admin_stats();

-- 9. Se não houver usuários, criar alguns para teste
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles WHERE is_active = true) = 0 THEN
    INSERT INTO profiles (user_id, email, full_name, role, is_active, created_at)
    VALUES 
      (gen_random_uuid(), 'admin@teste.com', 'Administrador Teste', 'admin', true, now()),
      (gen_random_uuid(), 'usuario1@teste.com', 'Usuário 1', 'user', true, now()),
      (gen_random_uuid(), 'usuario2@teste.com', 'Usuário 2', 'user', true, now());
    
    RAISE NOTICE 'Usuários de teste criados!';
  ELSE
    RAISE NOTICE 'Usuários já existem no sistema.';
  END IF;
END $$;

-- 10. Verificar resultado final
SELECT 
  'Usuários ativos: ' || (SELECT COUNT(*) FROM profiles WHERE is_active = true) as info,
  'Novos usuários (30 dias): ' || (SELECT COUNT(*) FROM profiles WHERE is_active = true AND created_at >= now() - interval '30 days') as info2,
  'Relatórios: ' || (SELECT COUNT(*) FROM profiles WHERE is_active = true) as info3;
```

### 2. Passos para Aplicar

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole todo o script acima**
4. **Clique em "Run"**
5. **Aguarde a execução completa**

### 3. Verificar Resultados

Após executar, você deve ver:

1. **Contagem de usuários** (pode ser 0 inicialmente)
2. **Lista de funções criadas** (5 funções)
3. **Teste da função get_admin_stats** (JSON com estatísticas)
4. **Mensagem sobre usuários de teste** (se criados)
5. **Resumo final** com números

### 4. Testar o Dashboard

1. **Recarregue a página** (Ctrl+F5)
2. **Faça login** como administrador
3. **Verifique se as estatísticas aparecem**
4. **Confirme que não há mais erro 404**

### 5. Funcionalidades Criadas

✅ **get_admin_stats** - Estatísticas do painel
✅ **get_all_users** - Lista de usuários
✅ **get_user_by_id** - Buscar usuário específico
✅ **update_user_by_admin** - Editar usuários
✅ **is_admin** - Verificar se é admin

### 6. Resultado Esperado

O painel do administrador deve mostrar:
- ✅ **Número real de usuários ativos**
- ✅ **Novos usuários (30 dias)**
- ✅ **Contador de relatórios**
- ✅ **Sem erro 404**
- ✅ **Loading states funcionando**

### 7. Se Ainda Houver Problemas

Execute este comando para verificar:

```sql
-- Verificar se a função existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'get_admin_stats';

-- Testar a função
SELECT public.get_admin_stats();

-- Verificar usuários
SELECT COUNT(*) FROM profiles WHERE is_active = true;
```

**Execute o script completo agora e teste o Dashboard!** 🚀
