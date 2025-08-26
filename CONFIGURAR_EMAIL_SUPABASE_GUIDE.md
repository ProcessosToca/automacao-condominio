# 📧 Configurar Email do Supabase - Guia Completo

## 🎯 Objetivo
Configurar o sistema de email do Supabase para enviar a nova senha gerada automaticamente.

## 📋 Passos para Configuração

### 1. Executar SQL no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Vá para **SQL Editor**
3. Clique em **"New query"**
4. Cole o conteúdo do arquivo `CONFIGURAR_EMAIL_SUPABASE_FINAL.sql`
5. Clique em **"Run"**

### 2. Configurar Template de Email

1. No Supabase Dashboard, vá para **Authentication** > **Emails** > **Templates**
2. Clique na aba **"Reset Password"**
3. Clique na sub-aba **"<> Source"**
4. **Apague todo o conteúdo atual**
5. **Cole o HTML** do arquivo `TEMPLATE_EMAIL_RESET_PASSWORD.html`
6. No campo **"Subject heading"**, digite: `Sua Nova Senha - Sistema de Gestão`
7. Clique em **"Save changes"**

### 3. Testar a Funcionalidade

1. Acesse a aplicação: http://localhost:8080
2. Clique em **"Esqueci minha senha"**
3. Digite um email válido
4. Clique em **"Gerar Nova Senha"**
5. Verifique se o email foi recebido com a nova senha

## 🔧 Como Funciona

### Fluxo Completo:

1. **Usuário solicita reset de senha**
2. **Sistema gera nova senha** via função RPC
3. **Senha é atualizada** no banco de dados
4. **Email é enviado** via Supabase Auth
5. **Template HTML** é preenchido com a nova senha
6. **Usuário recebe email** com a nova senha
7. **Usuário pode fazer login** imediatamente

### Variáveis do Template:

- `{{ .NewPassword }}` - A nova senha gerada
- `{{ .SiteURL }}` - URL do site
- `{{ .Email }}` - Email do usuário
- `{{ .Token }}` - Token de confirmação

## 🎨 Template HTML

O template inclui:
- ✅ Design moderno e responsivo
- ✅ Nova senha destacada
- ✅ Botão para acessar o sistema
- ✅ Instruções claras
- ✅ Informações de segurança

## 🚨 Troubleshooting

### Email não está sendo enviado
1. Verifique se o template foi salvo corretamente
2. Confirme se a função RPC foi executada
3. Verifique os logs do Supabase

### Template não está sendo aplicado
1. Certifique-se de que clicou em "Save changes"
2. Aguarde alguns minutos para a propagação
3. Teste novamente

### Erro na função RPC
1. Execute o SQL novamente
2. Verifique se não há erros de sintaxe
3. Confirme se a tabela `profiles` existe

## 📧 URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
- **SQL Editor**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg/sql
- **Authentication > Emails**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg/auth/templates

## 🎯 Resultado Final

Após a configuração:
- ✅ Nova senha gerada automaticamente
- ✅ Email enviado via Supabase Auth
- ✅ Template HTML profissional
- ✅ Senha exibida no email
- ✅ Usuário pode fazer login imediatamente
- ✅ Sistema funcionando sem dependências externas

## 🔄 Próximos Passos

1. **Teste a funcionalidade** completa
2. **Verifique se o email** está sendo recebido
3. **Confirme que a nova senha** funciona no login
4. **Ajuste o template** se necessário

## 📝 Notas Importantes

- O sistema usa o serviço de email nativo do Supabase
- Não há dependências externas (SendGrid, Resend, etc.)
- O template HTML é responsivo e funciona em todos os clientes de email
- A nova senha é gerada com 10 caracteres seguros

