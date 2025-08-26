import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Template HTML para o email de reset de senha
const getEmailTemplate = (newPassword: string, loginUrl: string = 'http://localhost:8080') => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Senha - Sistema de Gestão</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .greeting {
            color: #333;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .description {
            color: #555;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .password-section {
            background: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .password-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .password-display {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            color: #333;
            letter-spacing: 3px;
            border: 1px solid #e0e0e0;
            margin: 10px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
            line-height: 1.5;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 12px;
            line-height: 1.5;
        }
        .footer p {
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content {
                padding: 25px 20px;
            }
            .password-display {
                font-size: 16px;
                letter-spacing: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Nova Senha Gerada</h1>
            <p>Sistema de Gestão</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <strong>Olá!</strong>
            </div>
            
            <div class="description">
                Uma nova senha foi gerada para sua conta no sistema. Use esta senha para fazer login imediatamente.
            </div>
            
            <div class="password-section">
                <div class="password-label">Sua nova senha:</div>
                <div class="password-display">${newPassword}</div>
            </div>
            
            <div class="warning">
                <p>
                    <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere esta senha após fazer login no sistema.
                </p>
            </div>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="cta-button">
                    Acessar Sistema
                </a>
            </div>
            
            <div class="description" style="margin-top: 30px;">
                Se você não solicitou esta alteração, entre em contato conosco imediatamente para garantir a segurança da sua conta.
            </div>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, não responda a esta mensagem.</p>
            <p>© 2024 Sistema de Gestão. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const { email, newPassword, loginUrl } = await req.json()

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Email e nova senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // URL de login padrão se não fornecida
    const defaultLoginUrl = loginUrl || 'http://localhost:8080';
    
    // Gerar template HTML com a nova senha
    const emailHtml = getEmailTemplate(newPassword, defaultLoginUrl);

    // Enviar email usando SendGrid
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    
    if (!SENDGRID_API_KEY) {
      console.log(`📧 [SIMULAÇÃO] Email enviado para ${email} com nova senha: ${newPassword}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email enviado com sucesso (modo simulação)',
          debug_password: newPassword,
          email_html: emailHtml // Para debug
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
            subject: '🔐 Nova Senha Gerada - Sistema de Gestão',
          },
        ],
        from: { email: 'noreply@inteliscribe.com', name: 'Sistema de Gestão' },
        content: [
          {
            type: 'text/html',
            value: emailHtml,
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
