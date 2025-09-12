// Script para criar a tabela spreadsheet_data diretamente
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTableDirect() {
  console.log('🚀 Criando tabela spreadsheet_data diretamente...\n');

  try {
    // Usar service role key para operações administrativas
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTY3MjgwMCwiZXhwIjoyMDUxMjQ4ODAwfQ.sbp_ac130339cc0f52d54a0251da6879da2b7a196ce1';
    
    const headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    };

    // SQL para criar a tabela
    const createTableSQL = `
      CREATE TABLE public.spreadsheet_data (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        numero_ocorrencia TEXT,
        titulo TEXT,
        descricao TEXT,
        status TEXT,
        prioridade TEXT,
        edificio TEXT,
        endereco TEXT,
        numero TEXT,
        complemento TEXT,
        admin_nome TEXT,
        admin_email TEXT,
        admin_telefone TEXT,
        coletor_responsavel TEXT,
        coletor_telefone TEXT,
        valor_debito DECIMAL(10,2),
        data_vencimento DATE,
        situacao_pagamento TEXT,
        data_ocorrencia DATE,
        data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now(),
        observacoes TEXT,
        processado BOOLEAN DEFAULT false,
        data_processamento TIMESTAMP WITH TIME ZONE,
        erro_processamento TEXT,
        occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    console.log('📝 Executando SQL para criar tabela...');
    
    // Tentar executar via rpc
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sql: createTableSQL
      })
    });

    if (response.ok) {
      console.log('   ✅ Tabela criada com sucesso!');
    } else {
      console.log('   ❌ Erro ao criar tabela:', response.status);
      const error = await response.text();
      console.log('   Detalhes:', error);
    }

    // Verificar se a tabela foi criada
    console.log('\n🔍 Verificando se a tabela foi criada...');
    const checkResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=id&limit=1', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      }
    });

    if (checkResponse.ok) {
      console.log('   ✅ Tabela spreadsheet_data existe e está acessível!');
      console.log('   🎯 Execute: node test_spreadsheet_system.js');
    } else if (checkResponse.status === 404) {
      console.log('   ❌ Tabela ainda não existe');
      console.log('   📝 Aplique a migração manualmente no Supabase Dashboard');
    } else {
      console.log('   ❌ Erro ao verificar tabela:', checkResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createTableDirect();




