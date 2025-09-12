// Script para configurar o sistema de planilha
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function setupSpreadsheetSystem() {
  console.log('🚀 Configurando sistema de planilha...\n');

  try {
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Content-Type': 'application/json'
    };

    // 1. Verificar se a tabela spreadsheet_data existe
    console.log('1️⃣ Verificando tabela spreadsheet_data...');
    const tableResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=id&limit=1', {
      headers
    });

    if (tableResponse.ok) {
      console.log('   ✅ Tabela spreadsheet_data já existe');
    } else if (tableResponse.status === 404) {
      console.log('   ❌ Tabela spreadsheet_data não existe');
      console.log('   📝 Aplique a migração SQL no Supabase Dashboard:');
      console.log('   - Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg');
      console.log('   - Vá em SQL Editor');
      console.log('   - Cole o SQL da migração: supabase/migrations/20250101000004_create_spreadsheet_table.sql');
      console.log('   - Execute a query');
    } else {
      console.log('   ❌ Erro ao verificar tabela:', tableResponse.status);
    }

    // 2. Testar importação da planilha
    console.log('\n2️⃣ Testando importação da planilha...');
    const importResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/import-spreadsheet', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        clearExisting: true
      })
    });

    if (importResponse.ok) {
      const result = await importResponse.json();
      console.log('   ✅ Importação funcionando!');
      console.log(`   📊 Resultado: ${result.imported} registros importados`);
      if (result.errors > 0) {
        console.log(`   ⚠️ ${result.errors} erros encontrados`);
      }
    } else {
      console.log('   ❌ Erro na importação:', importResponse.status);
      const error = await importResponse.text();
      console.log('   Detalhes:', error);
    }

    // 3. Verificar dados importados
    console.log('\n3️⃣ Verificando dados importados...');
    const dataResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=*&limit=5', {
      headers
    });

    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log(`   📊 Total de registros na tabela: ${data.length}`);
      
      if (data.length > 0) {
        console.log('   📋 Exemplos de dados:');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.numero_ocorrencia} - ${item.titulo} (${item.edificio})`);
        });
      }
    } else {
      console.log('   ❌ Erro ao verificar dados:', dataResponse.status);
    }

    console.log('\n🎯 Sistema de planilha configurado!');
    console.log('   📱 Acesse: http://localhost:8080/spreadsheet-management');
    console.log('   🔄 Recarregue a página para ver os dados importados');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

setupSpreadsheetSystem();




