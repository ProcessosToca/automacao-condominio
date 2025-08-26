# 📧 Solução Completa para Envio de Emails

## 🎯 Objetivo
Implementar envio de emails reais com a nova senha gerada.

## 🚀 Opção 1: SendGrid (Recomendado)

### Passo 1: Criar Conta SendGrid
1. Acesse: https://sendgrid.com/
2. Clique em "Start for Free"
3. Crie conta gratuita (100 emails/dia)
4. Verifique seu email

### Passo 2: Obter API Key
1. No painel → Settings → API Keys
2. Create API Key → Nome: `inteliscribe-email`
3. Permissões: Restricted Access → Mail Send
4. Copie a API Key

### Passo 3: Deploy Edge Function
1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Edge Functions → Create new function
3. Nome: `send-password-reset`
4. Cole o código da Edge Function
5. Deploy

### Passo 4: Configurar API Key
```bash
npx supabase secrets set SENDGRID_API_KEY=sua_api_key_aqui
```

## 🔧 Opção 2: Resend (Alternativa)

### Passo 1: Criar Conta Resend
1. Acesse: https://resend.com/
2. Crie conta gratuita (100 emails/dia)
3. Verifique domínio

### Passo 2: Obter API Key
1. API Keys → Create API Key
2. Copie a chave

### Passo 3: Atualizar Edge Function
Substituir SendGrid por Resend no código.

## 📧 Opção 3: EmailJS (Frontend)

### Passo 1: Instalar EmailJS
```bash
npm install @emailjs/browser
```

### Passo 2: Configurar
1. Crie conta em https://www.emailjs.com/
2. Configure template de email
3. Obtenha as chaves necessárias

### Passo 3: Implementar no Frontend
```typescript
import emailjs from '@emailjs/browser';

const sendEmail = async (email: string, newPassword: string) => {
  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      {
        to_email: email,
        new_password: newPassword,
      },
      'YOUR_PUBLIC_KEY'
    );
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error };
  }
};
```

## 🎯 Opção 4: Nodemailer + Backend

### Passo 1: Criar API Route
```typescript
// pages/api/send-password-reset.ts
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, newPassword } = req.body;

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Nova Senha - Sistema de Gestão',
      html: `
        <h2>Nova Senha Gerada</h2>
        <p>Sua nova senha é: <strong>${newPassword}</strong></p>
        <p>Use esta senha para fazer login.</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

## 🚀 Implementação Rápida (Recomendada)

### Passo 1: Deploy Edge Function
1. Acesse o Supabase Dashboard
2. Edge Functions → Create new function
3. Nome: `send-password-reset`
4. Cole o código atualizado
5. Deploy

### Passo 2: Configurar SendGrid
1. Crie conta SendGrid
2. Obtenha API Key
3. Configure: `npx supabase secrets set SENDGRID_API_KEY=sua_chave`

### Passo 3: Atualizar AuthContext
```typescript
// Voltar a usar Edge Function
const { data: emailData, error: emailError } = await supabase.functions.invoke('send-password-reset', {
  body: {
    email: email,
    newPassword: newPassword
  }
});
```

## 📋 Checklist de Implementação

- [ ] Deploy Edge Function
- [ ] Configurar serviço de email (SendGrid/Resend)
- [ ] Configurar API Key
- [ ] Testar envio de email
- [ ] Verificar entrega
- [ ] Configurar domínio verificado (opcional)

## 🎯 Resultado Final

Após implementação:
- ✅ Email enviado automaticamente
- ✅ Template profissional
- ✅ Nova senha no email
- ✅ Link para acessar sistema
- ✅ Avisos de segurança

---

**Qual opção você prefere?** Posso ajudar com qualquer uma delas! 🚀
