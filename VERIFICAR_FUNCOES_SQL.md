# Verificar e Aplicar Funções SQL

## Problema Identificado

O sistema de gerenciamento de usuários pode não estar funcionando porque as funções SQL não foram aplicadas no Supabase.

## Solução

### 1. Aplicar as Funções SQL

**IMPORTANTE:** Execute este script no Supabase SQL Editor:

```sql
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
```

### 2. Verificar se as Funções foram Criadas

Após executar o script, verifique no Supabase Dashboard:

1. Vá para **Database** > **Functions**
2. Procure pelas funções:
   - `get_all_users()`
   - `get_user_by_id(p_user_id)`
   - `update_user_by_admin(...)`

### 3. Testar o Sistema

1. **Faça login como administrador**
2. **Acesse o Dashboard**
3. **Clique em "Gerenciar Usuários"**
4. **Verifique se a lista aparece**

### 4. Troubleshooting

**Se a lista não aparecer:**

1. **Verifique o console do navegador** para erros
2. **Confirme se o usuário é admin** no banco de dados
3. **Verifique se existem usuários** na tabela `profiles`
4. **Teste a função diretamente** no SQL Editor:

```sql
SELECT * FROM profiles WHERE is_active = true;
```

**Se houver erro de função não encontrada:**
- Execute novamente o script SQL
- Verifique se não há erros de sintaxe
- Confirme se as funções aparecem na lista de funções

### 5. Verificar Usuários no Banco

Para verificar se existem usuários cadastrados:

```sql
SELECT 
  user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
WHERE is_active = true
ORDER BY created_at DESC;
```

## Próximos Passos

Após aplicar as funções SQL, o sistema deve funcionar corretamente e exibir a lista de todos os usuários quando um administrador clicar em "Gerenciar Usuários".
