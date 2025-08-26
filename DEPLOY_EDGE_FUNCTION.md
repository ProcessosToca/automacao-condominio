# 🚀 Deploy da Edge Function para Reset de Senha

## 📋 Pré-requisitos

1. Supabase CLI instalado
2. Projeto linkado ao Supabase

## 🔧 Passos para Deploy

### 1. Verificar se o projeto está linkado
```bash
npx supabase status
```

Se não estiver linkado:
```bash
npx supabase link --project-ref jamzaegwhzmtvierjckg
```

### 2. Deploy da Edge Function
```bash
npx supabase functions deploy send-password-reset
```

### 3. Verificar se foi deployado
```bash
npx supabase functions list
```

## 📧 Configuração de Email (Opcional)

Para usar um serviço de email real, edite `supabase/functions/send-password-reset/index.ts`:

### SendGrid
1. Crie uma conta no SendGrid
2. Obtenha uma API Key
3. Configure a variável de ambiente:
```bash
npx supabase secrets set SENDGRID_API_KEY=sua_api_key_aqui
```

### Mailgun
1. Crie uma conta no Mailgun
2. Obtenha as credenciais
3. Configure as variáveis:
```bash
npx supabase secrets set MAILGUN_API_KEY=sua_api_key
npx supabase secrets set MAILGUN_DOMAIN=seu_dominio.com
```

## 🧪 Teste da Funcionalidade

1. Acesse a aplicação
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Clique em "Gerar Nova Senha"
5. Verifique o console do navegador para ver a nova senha
6. Faça login com a nova senha

## 🔍 Debug

Se houver problemas:

1. **Verificar logs da Edge Function:**
```bash
npx supabase functions logs send-password-reset
```

2. **Verificar se as funções RPC foram criadas:**
- Acesse o Supabase Dashboard
- Vá para SQL Editor
- Execute: `SELECT * FROM pg_proc WHERE proname LIKE '%password%';`

3. **Testar função RPC diretamente:**
```sql
SELECT public.generate_and_update_password('seu@email.com');
```

## 📝 Notas

- A senha gerada tem 10 caracteres
- Inclui letras maiúsculas, minúsculas, números e símbolos
- A senha é exibida no toast e no console para debug
- Em produção, remova a exibição da senha no response
