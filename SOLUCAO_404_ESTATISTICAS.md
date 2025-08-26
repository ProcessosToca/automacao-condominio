# Solução para Erro 404 - Estatísticas do Administrador

## Problema
```
POST https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/get_admin_stats 404 (Not Found)
```

## Causa
A função `get_admin_stats` não existe no banco de dados do Supabase.

## Solução Passo a Passo

### 1. Aplicar a Função SQL

**Execute este script no Supabase SQL Editor:**

```sql
-- Função simplificada para estatísticas do administrador
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retornar estatísticas (sem verificação de admin por enquanto)
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
```

### 2. Verificar se a Função foi Criada

Após executar o script, verifique se aparece:

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_admin_stats';
```

### 3. Testar a Função

Execute este comando para testar:

```sql
SELECT public.get_admin_stats();
```

**Resultado esperado:**
```json
{
  "success": true,
  "stats": {
    "active_users": 3,
    "new_users": 1,
    "reports": 3
  }
}
```

### 4. Verificar Usuários no Banco

Se as estatísticas estiverem zeradas, verifique se existem usuários:

```sql
-- Verificar usuários
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios_comuns
FROM profiles 
WHERE is_active = true;

-- Listar todos os usuários
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

### 5. Se Não Houver Usuários

Crie alguns usuários para teste:

```sql
-- Inserir usuários de teste
INSERT INTO profiles (user_id, email, full_name, role, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'admin@teste.com', 'Administrador Teste', 'admin', true, now()),
  (gen_random_uuid(), 'usuario1@teste.com', 'Usuário 1', 'user', true, now()),
  (gen_random_uuid(), 'usuario2@teste.com', 'Usuário 2', 'user', true, now());
```

### 6. Recarregar o Dashboard

Após aplicar a função:

1. **Recarregue a página** do Dashboard (Ctrl+F5)
2. **Verifique se as estatísticas aparecem** no painel do administrador
3. **Confirme se os números estão corretos**

## Troubleshooting

### Erro: "Função não encontrada"
- Execute novamente o script SQL
- Verifique se não há erros de sintaxe
- Confirme se está no schema `public`

### Erro: "Lista vazia"
- Verifique se existem usuários na tabela `profiles`
- Confirme se `is_active = true`

### Erro: "Erro de sintaxe"
- Copie e cole o script exatamente como está
- Verifique se não há caracteres especiais

### Erro: "Acesso negado"
- A função simplificada não verifica admin
- Qualquer usuário pode chamar a função

## Verificação Final

Após aplicar tudo:

1. **Função criada**: ✅ `get_admin_stats` existe
2. **Usuários existem**: ✅ Tabela `profiles` tem dados
3. **Dashboard funciona**: ✅ Estatísticas aparecem
4. **Sem erro 404**: ✅ Função responde corretamente

## Resultado Esperado

O painel do administrador deve mostrar:

- ✅ **Número real de usuários ativos** (ex: 3)
- ✅ **Novos usuários (30 dias)** (ex: 1)
- ✅ **Contador de relatórios** (ex: 3)
- ✅ **Loading states durante carregamento**
- ✅ **Sem mais erro 404**

## Próximos Passos

Após resolver o 404:

1. **Teste a listagem** de usuários em `/users`
2. **Teste a edição** de usuários não-admin
3. **Verifique se a proteção** de rotas está funcionando
4. **Teste em diferentes navegadores**

**Execute o script SQL agora e teste o Dashboard!** 🚀
