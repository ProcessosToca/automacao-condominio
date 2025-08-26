# 🚀 Deploy Manual da Edge Function

## ❌ Problema Atual
O erro de CORS acontece porque a Edge Function `send-password-reset` não está deployada no Supabase.

## ✅ Solução: Deploy Manual

### Passo 1: Acessar o Dashboard
1. Vá para: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Faça login se necessário

### Passo 2: Criar Edge Function
1. No menu lateral, clique em **Edge Functions**
2. Clique em **Create a new function**
3. Nome: `send-password-reset`
4. Clique em **Create function**

### Passo 3: Colar o Código
1. Após criar, você verá um editor
2. **Apague todo o código padrão**
3. **Cole o código abaixo:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Email e nova senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enviar email usando SendGrid
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.log(`📧 [SIMULAÇÃO] Email enviado para ${email} com nova senha: ${newPassword}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email enviado com sucesso (modo simulação)',
          debug_password: newPassword 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email }],
            subject: 'Nova senha - Sistema de Gestão',
          },
        ],
        from: { email: 'noreply@inteliscribe.com' },
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">🔐 Nova Senha Gerada</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestão</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                  <h2 style="color: #333; margin-top: 0;">Olá!</h2>
                  
                  <p style="color: #555; line-height: 1.6;">
                    Uma nova senha foi gerada para sua conta no sistema.
                  </p>
                  
                  <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Sua nova senha:</p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #333; letter-spacing: 2px;">
                      ${newPassword}
                    </div>
                  </div>
                  
                  <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      <strong>⚠️ Importante:</strong> Por segurança, altere esta senha após fazer login no sistema.
                    </p>
                  </div>
                  
                  <p style="color: #555; line-height: 1.6;">
                    Se você não solicitou esta alteração, entre em contato conosco imediatamente.
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:8080" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                      Acessar Sistema
                    </a>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                  <p>Este é um email automático, não responda a esta mensagem.</p>
                  <p>© 2024 Sistema de Gestão. Todos os direitos reservados.</p>
                </div>
              </div>
            `,
          },
        ],
      }),
    })

    if (response.ok) {
      console.log(`📧 Email enviado com sucesso para ${email}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email enviado com sucesso',
          debug_password: newPassword 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      const errorText = await response.text()
      console.error('Erro SendGrid:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar email',
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### Passo 4: Salvar e Deploy
1. Clique em **Save**
2. Clique em **Deploy**
3. Aguarde o deploy terminar

### Passo 5: Testar
1. Volte para a aplicação
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Clique em "Gerar Nova Senha"
5. A nova senha deve aparecer no toast

## 🎯 Resultado Esperado

Após o deploy:
- ✅ Erro de CORS desaparece
- ✅ Nova senha é gerada e exibida
- ✅ Email é "enviado" (modo simulação)
- ✅ Usuário pode fazer login com a nova senha

## 🔧 Próximos Passos (Opcional)

Para emails reais:
1. Configure SendGrid (ver `CONFIGURAR_EMAIL_COMPLETO.md`)
2. Adicione a API Key nas variáveis de ambiente
3. A função enviará emails reais automaticamente

---

**Pronto!** Agora a funcionalidade "Esqueci minha senha" deve funcionar perfeitamente! 🎉
