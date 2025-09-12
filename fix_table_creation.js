// Script para criar a tabela usando a service role key correta
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fixTableCreation() {
  console.log('🚀 Criando tabela spreadsheet_data...\n');

  try {
    // Service role key correta (você forneceu anteriormente)
    const serviceRoleKey = 'sbp_ac130339cc0f52d54a0251da6879da2b7a196ce1';
    
    const headers = {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    };

    console.log('📝 Tentando criar tabela via API REST...');

    // Tentar criar a tabela usando uma abordagem diferente
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.spreadsheet_data (
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
        occurrence_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    // Tentar executar via função SQL
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/exec', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sql: createTableSQL
      })
    });

    console.log('Status da resposta:', response.status);

    if (response.ok) {
      const result = await response.text();
      console.log('   ✅ Tabela criada com sucesso!');
      console.log('   Resultado:', result);
    } else {
      const error = await response.text();
      console.log('   ❌ Erro ao criar tabela:', response.status);
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
      console.log('   🎯 Recarregue a página: http://localhost:8080/spreadsheet-management');
    } else if (checkResponse.status === 404) {
      console.log('   ❌ Tabela ainda não existe');
      console.log('   📝 Aplique a migração manualmente no Supabase Dashboard');
      console.log('   📋 Veja o arquivo: SOLUCAO_TABELA_PLANILHA.md');
    } else {
      console.log('   ❌ Erro ao verificar tabela:', checkResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixTableCreation();




