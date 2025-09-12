// Teste completo do sistema de emails
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCompleteSystem() {
  console.log('🚀 Testando sistema completo de emails...\n');

  try {
    // 1. Testar se a função responde (sem autenticação)
    console.log('1️⃣ Testando resposta da função...');
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-bulk-emails', {
      method: 'OPTIONS'
    });
    console.log('   Status OPTIONS:', response.status);
    
    if (response.status === 200) {
      console.log('   ✅ Função respondendo corretamente\n');
    } else {
      console.log('   ❌ Função com problema\n');
      return;
    }

    // 2. Testar POST com autenticação (modo teste)
    console.log('2️⃣ Testando POST em modo teste...');
    const postResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-bulk-emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 1,
        testMode: true
      })
    });

    console.log('   Status POST:', postResponse.status);
    const data = await postResponse.text();
    console.log('   Response:', data);

    if (postResponse.ok) {
      console.log('   ✅ POST funcionando!\n');
    } else {
      console.log('   ❌ Erro no POST\n');
    }

    // 3. Instruções para o usuário
    console.log('3️⃣ Próximos passos:');
    console.log('   📝 Aplicar migração SQL no Supabase Dashboard:');
    console.log('   - Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg');
    console.log('   - Vá em SQL Editor');
    console.log('   - Cole o SQL da migração: supabase/migrations/20250101000003_add_email_status_to_occurrences.sql');
    console.log('   - Execute a query\n');
    
    console.log('   🧪 Testar no frontend:');
    console.log('   - Acesse: http://localhost:8080/bulk-emails');
    console.log('   - Clique em "Iniciar Processamento"');
    console.log('   - Deve funcionar em modo teste\n');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCompleteSystem();




