# Instruções para Aplicar Migrações

## Migração Necessária

Para que as funcionalidades de editar perfil e alterar senha funcionem corretamente, é necessário aplicar a migração do Supabase.

### Arquivo de Migração
- `supabase/migrations/20250101000000_add_cpf_and_update_profile.sql`

### O que a migração faz:
1. Adiciona a coluna `cpf` à tabela `profiles`
2. Cria a função `update_user_profile` para atualizar dados do usuário
3. Cria a função `update_user_password_by_id` para alterar senha

### Como aplicar:

#### Opção 1: Via Supabase CLI (Recomendado)
```bash
# Se você tem o projeto linkado
npx supabase db push

# Ou se precisa linkar primeiro
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

#### Opção 2: Via Dashboard do Supabase
1. Acesse o dashboard do Supabase
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `20250101000000_add_cpf_and_update_profile.sql`
4. Execute a query

#### Opção 3: Localmente (se Docker estiver configurado)
```bash
npx supabase start
npx supabase db reset
```

### Verificação
Após aplicar a migração, as seguintes funcionalidades estarão disponíveis:
- ✅ Editar perfil (nome, email, telefone, CPF)
- ✅ Alterar senha
- ✅ Validação de email único
- ✅ Verificação de senha atual

### Estrutura da Tabela Atualizada
```sql
profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT,
  password TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  cpf TEXT, -- NOVA COLUNA
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```
