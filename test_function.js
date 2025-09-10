// Teste simples da função send-bulk-emails
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFunction() {
  try {
    console.log('🧪 Testando função send-bulk-emails...');
    
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-bulk-emails', {
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

    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📄 Response:', data);
    
    if (response.ok) {
      console.log('✅ Função funcionando!');
    } else {
      console.log('❌ Erro na função');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testFunction();
