# Aplicar Funções de Gerenciamento de Usuários

## Passo a Passo

### 1. Aplicar as Funções SQL

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `apply_user_management.sql`
4. Clique em **Run** para executar

### 2. Verificar se as Funções foram Criadas

Após executar o script, você deve ver as seguintes funções criadas:

- `get_all_users()` - Lista todos os usuários (apenas para admins)
- `get_user_by_id(p_user_id)` - Busca usuário específico
- `update_user_by_admin(...)` - Atualiza dados de usuário

### 3. Testar a Funcionalidade

1. **Faça login como administrador**
2. **Acesse o Dashboard**
3. **Clique em "Gerenciar Usuários"** (botão azul)
4. **Verifique se a lista de usuários aparece**
5. **Teste editar um usuário não-admin**

## Funcionalidades Implementadas

### ✅ Listagem de Usuários
- Apenas administradores podem ver a lista
- Mostra nome, email, telefone, perfil e data de cadastro
- Interface limpa e responsiva

### ✅ Edição de Usuários
- Apenas usuários não-admin podem ser editados
- Campos editáveis: nome, email, telefone, CPF
- Validação de email único
- Feedback visual de sucesso/erro

### ✅ Proteção de Rotas
- Página só acessível para administradores
- Redirecionamento automático se não for admin
- Mensagens de erro claras

### ✅ Interface Intuitiva
- Botão no Dashboard para admins
- Tabela organizada com ações
- Modal de edição com formulário
- Loading states e feedback

## Estrutura de Arquivos

```
src/
├── pages/
│   ├── UserManagement.tsx    # Página de gerenciamento
│   └── Dashboard.tsx         # Link para gerenciamento
├── contexts/
│   └── AuthContext.tsx       # Funções getAllUsers, updateUser, isAdmin
└── App.tsx                   # Rota /users

supabase/
└── migrations/
    └── 20250101000002_add_user_management_functions.sql

apply_user_management.sql     # Script para aplicar funções
```

## Próximos Passos

Após aplicar as funções SQL, o sistema estará funcionando completamente. Os administradores poderão:

1. **Visualizar todos os usuários** na página `/users`
2. **Editar dados de usuários** não-admin
3. **Ver feedback visual** das operações
4. **Navegar facilmente** entre Dashboard e Gerenciamento

## Troubleshooting

### Erro: "Função não encontrada"
- Verifique se o script SQL foi executado corretamente
- Confirme se as funções aparecem no Supabase Dashboard

### Erro: "Acesso negado"
- Certifique-se de estar logado como administrador
- Verifique se o usuário tem role = 'admin' no banco

### Lista vazia
- Verifique se existem usuários cadastrados
- Confirme se os usuários têm is_active = true
