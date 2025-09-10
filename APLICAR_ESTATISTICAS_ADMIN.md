# Aplicar Estatísticas do Administrador

## Resumo

Atualizei o painel do administrador para mostrar estatísticas reais:
- **Usuários Ativos**: Total de usuários ativos no sistema
- **Novos Usuários**: Usuários cadastrados nos últimos 30 dias
- **Relatórios Gerados**: Contador de relatórios (por enquanto baseado em usuários)

## Passo a Passo

### 1. Aplicar a Função SQL

Execute este script no **Supabase SQL Editor**:

```sql
-- Função para buscar estatísticas do administrador
CREATE OR REPLACE FUNCTION public.get_admin_stats()
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

  -- Retornar estatísticas
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
          FROM (
            SELECT 1 
            FROM profiles 
            WHERE is_active = true
          ) AS dummy_reports
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

Após executar o script, verifique se a função aparece:

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

### 4. Verificar o Dashboard

Após aplicar a função:

1. **Recarregue a página** do Dashboard
2. **Verifique se as estatísticas aparecem** no painel do administrador
3. **Confirme se os números estão corretos**

## Funcionalidades Implementadas

### ✅ Estatísticas em Tempo Real
- **Usuários Ativos**: Conta todos os usuários com `is_active = true`
- **Novos Usuários**: Conta usuários cadastrados nos últimos 30 dias
- **Relatórios**: Por enquanto usa o mesmo número de usuários ativos

### ✅ Loading States
- **Spinner de carregamento** enquanto busca as estatísticas
- **Feedback visual** durante o carregamento

### ✅ Atualização Automática
- **Carrega automaticamente** quando o usuário é admin
- **Recarrega** quando necessário

## Próximos Passos

Para melhorar ainda mais:

1. **Criar tabela de relatórios** para contagem real
2. **Adicionar mais estatísticas** (usuários por mês, etc.)
3. **Implementar cache** para melhor performance
4. **Adicionar gráficos** para visualização

## Troubleshooting

### Erro: "Função não encontrada"
- Execute novamente o script SQL
- Verifique se não há erros de sintaxe

### Erro: "Acesso negado"
- Verifique se o usuário logado é admin
- Confirme se a função `is_admin()` existe

### Estatísticas zeradas
- Verifique se existem usuários na tabela `profiles`
- Confirme se `is_active = true`

## Resultado Esperado

O painel do administrador deve mostrar:

- ✅ **Número real de usuários ativos**
- ✅ **Número de novos usuários (30 dias)**
- ✅ **Contador de relatórios**
- ✅ **Loading states durante carregamento**
- ✅ **Atualização automática dos dados**
