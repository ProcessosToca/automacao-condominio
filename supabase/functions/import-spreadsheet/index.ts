import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Função para fazer parse do CSV
function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('Planilha vazia');
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));

  return { headers, rows };
}

// Mapear dados da planilha para o formato do banco
function mapRowToDatabase(headers: string[], row: string[]): any {
  const data: any = {};
  
  headers.forEach((header, index) => {
    const value = row[index] || '';
    const cleanHeader = header.toLowerCase().trim();
    
    // Mapeamento flexível baseado no nome da coluna
    if (cleanHeader.includes('numero') || cleanHeader.includes('número')) {
      data.numero_ocorrencia = value;
    } else if (cleanHeader.includes('titulo') || cleanHeader.includes('título')) {
      data.titulo = value;
    } else if (cleanHeader.includes('descricao') || cleanHeader.includes('descrição')) {
      data.descricao = value;
    } else if (cleanHeader.includes('status')) {
      data.status = value;
    } else if (cleanHeader.includes('prioridade')) {
      data.prioridade = value;
    } else if (cleanHeader.includes('edificio') || cleanHeader.includes('edifício')) {
      data.edificio = value;
    } else if (cleanHeader.includes('endereco') || cleanHeader.includes('endereço')) {
      data.endereco = value;
    } else if (cleanHeader.includes('numero') && !cleanHeader.includes('ocorrencia')) {
      data.numero = value;
    } else if (cleanHeader.includes('complemento')) {
      data.complemento = value;
    } else if (cleanHeader.includes('admin') && cleanHeader.includes('nome')) {
      data.admin_nome = value;
    } else if (cleanHeader.includes('admin') && cleanHeader.includes('email')) {
      data.admin_email = value;
    } else if (cleanHeader.includes('admin') && cleanHeader.includes('telefone')) {
      data.admin_telefone = value;
    } else if (cleanHeader.includes('coletor') && cleanHeader.includes('responsavel')) {
      data.coletor_responsavel = value;
    } else if (cleanHeader.includes('coletor') && cleanHeader.includes('telefone')) {
      data.coletor_telefone = value;
    } else if (cleanHeader.includes('valor') || cleanHeader.includes('debito')) {
      data.valor_debito = value ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
    } else if (cleanHeader.includes('vencimento')) {
      data.data_vencimento = value ? new Date(value).toISOString().split('T')[0] : null;
    } else if (cleanHeader.includes('situacao') || cleanHeader.includes('situação')) {
      data.situacao_pagamento = value;
    } else if (cleanHeader.includes('data') && cleanHeader.includes('ocorrencia')) {
      data.data_ocorrencia = value ? new Date(value).toISOString().split('T')[0] : null;
    } else if (cleanHeader.includes('observacoes') || cleanHeader.includes('observações')) {
      data.observacoes = value;
    }
  });

  return data;
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
    const { clearExisting = false } = await req.json()

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🚀 Iniciando importação da planilha...')

    // 1. Buscar dados da planilha do Google Sheets
    const sheetId = '1feuzsTzqNnxiZvqHsF6RiYBmxhKjrq8dwP946rySuuI'
    const gid = '130052127'
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    
    console.log('📊 Buscando dados da planilha...')
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Erro ao acessar planilha: ${response.status}`)
    }
    
    const csvText = await response.text()
    const { headers, rows } = parseCSV(csvText)
    
    console.log(`📋 Headers encontrados: ${headers.join(', ')}`)
    console.log(`📊 Linhas de dados: ${rows.length}`)

    // 2. Limpar dados existentes se solicitado
    if (clearExisting) {
      console.log('🗑️ Limpando dados existentes...')
      const { error: deleteError } = await supabase
        .from('spreadsheet_data')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      if (deleteError) {
        console.error('Erro ao limpar dados:', deleteError)
      } else {
        console.log('✅ Dados existentes removidos')
      }
    }

    // 3. Processar e importar cada linha
    console.log('📥 Importando dados...')
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      try {
        const rowData = mapRowToDatabase(headers, rows[i])
        
        // Adicionar dados de controle
        rowData.processado = false
        rowData.data_cadastro = new Date().toISOString()

        const { error: insertError } = await supabase
          .from('spreadsheet_data')
          .insert(rowData)

        if (insertError) {
          errorCount++
          const errorMsg = `Linha ${i + 1}: ${insertError.message}`
          errors.push(errorMsg)
          console.error('❌', errorMsg)
        } else {
          successCount++
          if (successCount % 10 === 0) {
            console.log(`   ✅ ${successCount} registros importados...`)
          }
        }
      } catch (error) {
        errorCount++
        const errorMsg = `Linha ${i + 1}: ${error.message}`
        errors.push(errorMsg)
        console.error('❌', errorMsg)
      }
    }

    console.log('🎯 Importação concluída!')
    console.log(`   ✅ Sucessos: ${successCount}`)
    console.log(`   ❌ Erros: ${errorCount}`)
    console.log(`   📊 Total: ${rows.length}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Importação concluída: ${successCount} sucessos, ${errorCount} erros`,
        imported: successCount,
        errors: errorCount,
        total: rows.length,
        errorDetails: errors.slice(0, 10) // Primeiros 10 erros
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na importação:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Erro na importação da planilha'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

