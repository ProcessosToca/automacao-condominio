import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Template HTML para o email de cobrança
const getEmailTemplate = (occurrenceData: any) => {
  const { 
    id, 
    title, 
    properties: { name: edificio, address, admin_name },
    created_at 
  } = occurrenceData;

  // Extrair número do endereço se existir
  const addressParts = address ? address.split(',') : [];
  const endereco = addressParts[0] || '';
  const numero = addressParts[1] ? addressParts[1].trim() : '';
  const complemento = addressParts[2] ? addressParts[2].trim() : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consulta de Débitos - ${edificio}</title>
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
            font-size: 24px;
            font-weight: 600;
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
        .message {
            color: #555;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .property-info {
            background: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
        }
        .property-info h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 18px;
        }
        .property-detail {
            margin: 8px 0;
            color: #555;
            font-size: 16px;
        }
        .occurrence-number {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .occurrence-number strong {
            color: #1976d2;
            font-size: 18px;
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Consulta de Débitos</h1>
            <p>${edificio}</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <strong>Olá, boa tarde, tudo bem?</strong>
            </div>
            
            <div class="message">
                Olá, boa tarde, tudo bem?<br><br>
                Poderia por gentileza me informar se constam débitos de condomínio em aberto relacionados ao imóvel abaixo?
            </div>
            
            <div class="occurrence-number">
                <strong>Número da Ocorrência: ${id}</strong>
            </div>
            
            <div class="property-info">
                <h3>📋 Dados do Imóvel</h3>
                <div class="property-detail"><strong>Edifício:</strong> ${edificio}</div>
                <div class="property-detail"><strong>Endereço:</strong> ${endereco}${numero ? ', ' + numero : ''}${complemento ? ' - ' + complemento : ''}</div>
                ${admin_name ? `<div class="property-detail"><strong>Administrador:</strong> ${admin_name}</div>` : ''}
            </div>
            
            <div class="message" style="margin-top: 30px;">
                <strong>Obrigada!</strong>
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
    console.log('OPTIONS request received')
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const { limit = 10, testMode = false } = await req.json()

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar ocorrências que precisam de email
    const { data: occurrences, error: fetchError } = await supabase
      .from('occurrences')
      .select(`
        id,
        title,
        created_at,
        properties!inner(
          name,
          address,
          admin_name,
          admin_email
        )
      `)
      .eq('email_status', 'Não enviado')
      .not('properties.admin_email', 'is', null)
      .limit(limit)

    if (fetchError) {
      console.error('Erro ao buscar ocorrências:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar ocorrências', details: fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!occurrences || occurrences.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma ocorrência encontrada para envio',
          processed: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📧 Processando ${occurrences.length} emails...`)

    const results = []
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

    for (const occurrence of occurrences) {
      try {
        const email = occurrence.properties.admin_email
        const emailHtml = getEmailTemplate(occurrence)

        if (testMode || !SENDGRID_API_KEY) {
          // Modo teste - apenas simular envio
          console.log(`📧 [TESTE] Email simulado para ${email} - Ocorrência: ${occurrence.id}`)
          
          // Atualizar status para "Aguardando Retorno"
          await supabase
            .from('occurrences')
            .update({ 
              email_status: 'Aguardando Retorno',
              email_sent_at: new Date().toISOString()
            })
            .eq('id', occurrence.id)

          results.push({
            occurrenceId: occurrence.id,
            email: email,
            status: 'success',
            message: 'Email simulado com sucesso'
          })
        } else {
          // Envio real via SendGrid
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
                  subject: `Consulta de Débitos - ${occurrence.properties.name}`,
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
            // Atualizar status para "Aguardando Retorno"
            await supabase
              .from('occurrences')
              .update({ 
                email_status: 'Aguardando Retorno',
                email_sent_at: new Date().toISOString()
              })
              .eq('id', occurrence.id)

            results.push({
              occurrenceId: occurrence.id,
              email: email,
              status: 'success',
              message: 'Email enviado com sucesso'
            })

            console.log(`✅ Email enviado para ${email} - Ocorrência: ${occurrence.id}`)
          } else {
            const errorText = await response.text()
            
            // Atualizar status para "Erro no Envio"
            await supabase
              .from('occurrences')
              .update({ 
                email_status: 'Erro no Envio',
                email_error: errorText
              })
              .eq('id', occurrence.id)

            results.push({
              occurrenceId: occurrence.id,
              email: email,
              status: 'error',
              message: errorText
            })

            console.error(`❌ Erro ao enviar email para ${email}:`, errorText)
          }
        }
      } catch (error) {
        // Atualizar status para "Erro no Envio"
        await supabase
          .from('occurrences')
          .update({ 
            email_status: 'Erro no Envio',
            email_error: error.message
          })
          .eq('id', occurrence.id)

        results.push({
          occurrenceId: occurrence.id,
          email: occurrence.properties.admin_email,
          status: 'error',
          message: error.message
        })

        console.error(`❌ Erro ao processar ocorrência ${occurrence.id}:`, error)
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processamento concluído: ${successCount} sucessos, ${errorCount} erros`,
        processed: results.length,
        results: results,
        testMode: testMode
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro geral no processamento:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
