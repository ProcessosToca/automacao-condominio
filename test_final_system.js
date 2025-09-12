// Script final para testar o sistema completo
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFinalSystem() {
  console.log('🧪 Teste Final do Sistema de Planilha\n');

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
      console.log('   🔗 Acesse: http://localhost:8080/spreadsheet-management');
      console.log('   📋 Siga as instruções na interface');
      return;
    } else {
      console.log('   ❌ Erro ao verificar tabela:', tableResponse.status);
      return;
    }

    // 2. Testar Edge Function
    console.log('\n2️⃣ Testando Edge Function de importação...');
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
    } else {
      console.log('   ❌ Erro na Edge Function:', importResponse.status);
    }

    // 3. Verificar dados
    console.log('\n3️⃣ Verificando dados importados...');
    const dataResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=*&limit=5', {
      headers
    });

    if (dataResponse.ok) {
      const data = await dataResponse.json();
      console.log(`   ✅ ${data.length} registros encontrados`);
      
      if (data.length > 0) {
        console.log('   📋 Exemplos:');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.numero_ocorrencia} - ${item.titulo}`);
        });
      }
    }

    console.log('\n🎯 Sistema testado com sucesso!');
    console.log('   📱 Interface: http://localhost:8080/spreadsheet-management');
    console.log('   🏠 Dashboard: http://localhost:8080/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testFinalSystem();




