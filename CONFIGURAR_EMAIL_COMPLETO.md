# 📧 Configuração Completa de Email com SendGrid

## 🎯 Objetivo
Configurar o envio de emails reais com a nova senha gerada para o usuário.

## 📋 Passos para Configurar

### 1. Criar Conta no SendGrid
1. Acesse: https://sendgrid.com/
2. Clique em "Start for Free"
3. Crie uma conta gratuita (100 emails/dia)
4. Verifique seu email

### 2. Obter API Key
1. No painel do SendGrid, vá em **Settings** → **API Keys**
2. Clique em **Create API Key**
3. Nome: `inteliscribe-email`
4. Permissões: **Restricted Access** → **Mail Send**
5. Clique em **Create & View**
6. **Copie a API Key** (você só verá uma vez!)

### 3. Verificar Domínio (Opcional)
Para emails mais confiáveis:
1. Vá em **Settings** → **Sender Authentication**
2. Clique em **Verify a Domain**
3. Siga as instruções para verificar seu domínio

### 4. Configurar Variável de Ambiente
Execute no terminal:

```bash
# Fazer login no Supabase CLI
npx supabase login

# Configurar a API Key do SendGrid
npx supabase secrets set SENDGRID_API_KEY=sua_api_key_aqui
```

### 5. Deploy da Edge Function
```bash
# Deploy da função atualizada
npx supabase functions deploy send-password-reset
```

### 6. Testar a Funcionalidade
1. Acesse a aplicação
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Clique em "Gerar Nova Senha"
5. Verifique se o email foi recebido

## 🔧 Configuração Alternativa (Sem SendGrid)

Se não quiser usar SendGrid, a função funciona em modo simulação:

1. **Não configure** a variável `SENDGRID_API_KEY`
2. A função mostrará a nova senha no console e toast
3. O usuário pode copiar a senha manualmente

## 📧 Template do Email

O email inclui:
- ✅ Design moderno e responsivo
- ✅ Nova senha destacada
- ✅ Aviso de segurança
- ✅ Botão para acessar o sistema
- ✅ Informações da empresa

## 🚨 Troubleshooting

### Erro de CORS
- Verifique se a Edge Function foi deployada
- Teste: `npx supabase functions list`

### Erro de API Key
- Verifique se a API Key está correta
- Teste: `npx supabase secrets list`

### Email não chega
- Verifique a pasta de spam
- Confirme se o email está correto
- Verifique os logs: `npx supabase functions logs send-password-reset`

## 💡 Dicas

1. **Teste primeiro** com seu próprio email
2. **Use domínio verificado** para melhor entregabilidade
3. **Monitore os logs** para identificar problemas
4. **Configure webhooks** para tracking de emails (opcional)

## 🔒 Segurança

- A API Key do SendGrid tem permissões limitadas
- Emails são enviados apenas para reset de senha
- Senha é gerada aleatoriamente e criptografada
- Usuário é orientado a alterar a senha após login

---

**Pronto!** Agora o sistema enviará emails reais com a nova senha para os usuários. 🎉
