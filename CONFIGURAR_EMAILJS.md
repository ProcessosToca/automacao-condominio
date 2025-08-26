# 📧 Configurar EmailJS para Envio de Emails

## 🎯 Objetivo
Configurar EmailJS para enviar emails reais com a nova senha gerada.

## 🚀 Passo a Passo

### Passo 1: Criar Conta no EmailJS
1. Acesse: https://www.emailjs.com/
2. Clique em "Sign Up Free"
3. Crie uma conta gratuita (200 emails/mês)
4. Verifique seu email

### Passo 2: Configurar Serviço de Email
1. No painel do EmailJS, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha **Gmail** ou **Outlook**
4. Configure suas credenciais de email
5. **Copie o Service ID** (ex: `service_abc123`)

### Passo 3: Criar Template de Email
1. Vá em **Email Templates**
2. Clique em **Create New Template**
3. **Nome**: `password-reset`
4. **Assunto**: `Nova Senha - Sistema de Gestão`
5. **Conteúdo HTML**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nova Senha - Sistema de Gestão</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Cabeçalho -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Nova Senha Gerada</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestão</p>
        </div>
        
        <!-- Conteúdo -->
        <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">Olá {{user_name}}!</h2>
            
            <p style="color: #555; line-height: 1.6;">
                Uma nova senha foi gerada para sua conta no sistema.
            </p>
            
            <!-- Nova Senha -->
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Sua nova senha:</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #333; letter-spacing: 2px;">
                    {{new_password}}
                </div>
            </div>
            
            <!-- Aviso de Segurança -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    <strong>⚠️ Importante:</strong> Por segurança, altere esta senha após fazer login no sistema.
                </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
                Se você não solicitou esta alteração, entre em contato conosco imediatamente.
            </p>
            
            <!-- Botão -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:8080" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                    Acessar Sistema
                </a>
            </div>
        </div>
        
        <!-- Rodapé -->
        <div style="text-align: center; padding: 20px; background: #f8f9fa; color: #999; font-size: 12px;">
            <p style="margin: 0;">Este é um email automático, não responda a esta mensagem.</p>
            <p style="margin: 5px 0 0 0;">© 2024 Sistema de Gestão. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

6. **Salve o template**
7. **Copie o Template ID** (ex: `template_xyz789`)

### Passo 4: Obter Chave Pública
1. Vá em **Account** → **API Keys**
2. **Copie a Public Key** (ex: `user_abc123`)

### Passo 5: Atualizar Configurações
1. Abra o arquivo `src/services/emailService.ts`
2. Substitua as configurações:

```typescript
const EMAILJS_SERVICE_ID = 'seu_service_id_aqui';
const EMAILJS_TEMPLATE_ID = 'seu_template_id_aqui';
const EMAILJS_PUBLIC_KEY = 'sua_public_key_aqui';
```

### Passo 6: Ativar EmailJS
1. No arquivo `src/services/emailService.ts`
2. Descomente as linhas do EmailJS:

```typescript
// Remova os comentários /* */ das linhas:
const result = await emailjs.send(...);
console.log('📧 Email enviado com sucesso:', result);

// E também:
emailjs.init(EMAILJS_PUBLIC_KEY);
```

## 🧪 Testar

1. **Reinicie a aplicação**
2. **Clique em "Esqueci minha senha"**
3. **Digite um email válido**
4. **Clique em "Gerar Nova Senha"**
5. **Verifique se o email foi recebido**

## 🎯 Resultado Esperado

Após configuração:
- ✅ Email enviado automaticamente
- ✅ Template profissional
- ✅ Nova senha no email
- ✅ Link para acessar sistema
- ✅ Avisos de segurança

## 🔧 Troubleshooting

### Email não chega
- Verifique a pasta de spam
- Confirme se o email está correto
- Verifique os logs no console

### Erro de configuração
- Confirme se os IDs estão corretos
- Verifique se o serviço está ativo
- Teste com email diferente

## 💡 Dicas

1. **Teste primeiro** com seu próprio email
2. **Use domínio verificado** para melhor entregabilidade
3. **Monitore os logs** para identificar problemas
4. **Configure webhooks** para tracking (opcional)

---

**Pronto!** Agora o sistema enviará emails reais com a nova senha! 🎉
