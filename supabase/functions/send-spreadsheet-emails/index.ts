import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Template para emails da planilha
const getSpreadsheetEmailTemplate = (record: any) => {
  const { 
    numero_ocorrencia,
    edificio,
    endereco,
    numero,
    complemento
  } = record;

  // Montar endereço completo
  let endereco_completo = endereco || '';
  if (numero) {
    endereco_completo += `, ${numero}`;
  }
  if (complemento) {
    endereco_completo += ` - ${complemento}`;
  }

  return `Olá, boa tarde, tudo bem?
Poderia por gentileza me informar se constam débitos de condomínio em aberto relacionados ao imóvel abaixo?
${numero_ocorrencia || 'N/A'}

Obrigada!

${edificio || 'N/A'}
${endereco_completo}`;
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

    // Buscar registros da planilha que precisam de email
    const { data: records, error: fetchError } = await supabase
      .from('spreadsheet_data')
      .select('*')
      .eq('processado', false)
      .not('admin_email', 'is', null)
      .limit(limit)

    if (fetchError) {
      console.error('Erro ao buscar registros da planilha:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar registros da planilha', details: fetchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum registro da planilha encontrado para envio',
          processed: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📧 Processando ${records.length} emails da planilha...`)

    const results = []
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

    for (const record of records) {
      try {
        const email = record.admin_email
        const emailContent = getSpreadsheetEmailTemplate(record)

        if (testMode || !SENDGRID_API_KEY) {
          // Modo teste - apenas simular envio
          console.log(`📧 [TESTE] Email simulado para ${email} - Registro: ${record.numero_ocorrencia}`)
          
          // Atualizar status para processado
          await supabase
            .from('spreadsheet_data')
            .update({ 
              processado: true,
              data_processamento: new Date().toISOString()
            })
            .eq('id', record.id)

          results.push({
            recordId: record.id,
            idImovel: record.numero_ocorrencia,
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
                  subject: `Consulta de Débitos - ${record.edificio}`,
                },
              ],
              from: { email: 'noreply@inteliscribe.com', name: 'Sistema de Gestão' },
              content: [
                {
                  type: 'text/plain',
                  value: emailContent,
                },
              ],
            }),
          })

          if (response.ok) {
            // Atualizar status para processado
            await supabase
              .from('spreadsheet_data')
              .update({ 
                processado: true,
                data_processamento: new Date().toISOString()
              })
              .eq('id', record.id)

            results.push({
              recordId: record.id,
              idImovel: record.numero_ocorrencia,
              email: email,
              status: 'success',
              message: 'Email enviado com sucesso'
            })

            console.log(`✅ Email enviado para ${email} - Registro: ${record.numero_ocorrencia}`)
          } else {
            const errorText = await response.text()
            
            // Atualizar status com erro
            await supabase
              .from('spreadsheet_data')
              .update({ 
                processado: false,
                erro_processamento: errorText
              })
              .eq('id', record.id)

            results.push({
              recordId: record.id,
              idImovel: record.numero_ocorrencia,
              email: email,
              status: 'error',
              message: errorText
            })

            console.error(`❌ Erro ao enviar email para ${email}:`, errorText)
          }
        }
      } catch (error) {
        // Atualizar status com erro
        await supabase
          .from('spreadsheet_data')
          .update({ 
            processado: false,
            erro_processamento: error.message
          })
          .eq('id', record.id)

        results.push({
          recordId: record.id,
          idImovel: record.numero_ocorrencia,
          email: record.admin_email,
          status: 'error',
          message: error.message
        })

        console.error(`❌ Erro ao processar registro ${record.id}:`, error)
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


