// Script para testar o sistema de planilha após aplicar a migração
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSpreadsheetSystem() {
  console.log('🧪 Testando sistema de planilha...\n');

  try {
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Content-Type': 'application/json'
    };

    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando tabela spreadsheet_data...');
    const tableResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=id&limit=1', {
      headers
    });

    if (tableResponse.ok) {
      console.log('   ✅ Tabela spreadsheet_data existe!');
    } else if (tableResponse.status === 404) {
      console.log('   ❌ Tabela spreadsheet_data não existe');
      console.log('   📝 Aplique a migração SQL no Supabase Dashboard');
      console.log('   📋 Veja o arquivo: APLICAR_MIGRACAO_PLANILHA.md');
      return;
    } else {
      console.log('   ❌ Erro ao verificar tabela:', tableResponse.status);
      const error = await tableResponse.text();
      console.log('   Detalhes:', error);
      return;
    }

    // 2. Testar inserção de dados de teste
    console.log('\n2️⃣ Testando inserção de dados...');
    const testData = {
      numero_ocorrencia: 'TEST-001',
      titulo: 'Teste de Importação',
      descricao: 'Dados de teste para verificar o sistema',
      edificio: 'Edifício Teste',
      admin_email: 'teste@exemplo.com',
      processado: false
    };

    const insertResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data', {
      method: 'POST',
      headers,
      body: JSON.stringify(testData)
    });

    if (insertResponse.ok) {
      console.log('   ✅ Inserção de dados funcionando!');
    } else {
      console.log('   ❌ Erro na inserção:', insertResponse.status);
      const error = await insertResponse.text();
      console.log('   Detalhes:', error);
    }

    // 3. Testar busca de dados
    console.log('\n3️⃣ Testando busca de dados...');
    const selectResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=*&limit=5', {
      headers
    });

    if (selectResponse.ok) {
      const data = await selectResponse.json();
      console.log(`   ✅ Busca funcionando! ${data.length} registros encontrados`);
      
      if (data.length > 0) {
        console.log('   📋 Exemplos de dados:');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.numero_ocorrencia} - ${item.titulo}`);
        });
      }
    } else {
      console.log('   ❌ Erro na busca:', selectResponse.status);
    }

    // 4. Testar Edge Function de importação
    console.log('\n4️⃣ Testando Edge Function de importação...');
    const importResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/import-spreadsheet', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clearExisting: false
      })
    });

    if (importResponse.ok) {
      const result = await importResponse.json();
      console.log('   ✅ Edge Function funcionando!');
      console.log(`   📊 Resultado: ${result.imported} registros importados`);
      if (result.errors > 0) {
        console.log(`   ⚠️ ${result.errors} erros encontrados`);
      }
    } else {
      console.log('   ❌ Erro na Edge Function:', importResponse.status);
      const error = await importResponse.text();
      console.log('   Detalhes:', error);
    }

    // 5. Limpar dados de teste
    console.log('\n5️⃣ Limpando dados de teste...');
    const deleteResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?numero_ocorrencia=eq.TEST-001', {
      method: 'DELETE',
      headers
    });

    if (deleteResponse.ok) {
      console.log('   ✅ Dados de teste removidos');
    } else {
      console.log('   ⚠️ Erro ao limpar dados de teste:', deleteResponse.status);
    }

    console.log('\n🎯 Sistema de planilha testado com sucesso!');
    console.log('   📱 Acesse: http://localhost:8080/spreadsheet-management');
    console.log('   🔄 Recarregue a página para ver os dados importados');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSpreadsheetSystem();

