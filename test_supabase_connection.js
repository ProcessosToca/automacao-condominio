// Script para testar a conexão com o Supabase
// Execute no console do navegador (F12)

const SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM";

console.log('🔍 Testando conexão com Supabase...');

// Teste 1: Verificar se a URL está acessível
fetch(SUPABASE_URL + '/rest/v1/', {
  method: 'GET',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
})
.then(response => {
  console.log('✅ URL do Supabase está acessível');
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('📄 Resposta:', data.substring(0, 100) + '...');
})
.catch(error => {
  console.error('❌ Erro ao acessar Supabase:', error);
  console.log('🔧 Possíveis soluções:');
  console.log('1. Verifique sua conexão com a internet');
  console.log('2. Verifique se o Supabase está online');
  console.log('3. Verifique se as credenciais estão corretas');
});

// Teste 2: Verificar se as funções RPC estão disponíveis
fetch(SUPABASE_URL + '/rest/v1/rpc/get_admin_stats', {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
.then(response => {
  console.log('📊 Teste da função get_admin_stats:');
  console.log('Status:', response.status);
  if (response.status === 404) {
    console.log('⚠️ Função não encontrada - precisa ser criada');
  } else if (response.status === 200) {
    console.log('✅ Função encontrada');
  }
  return response.text();
})
.then(data => {
  console.log('📄 Resposta:', data);
})
.catch(error => {
  console.error('❌ Erro ao testar função:', error);
});

// Teste 3: Verificar se a função is_admin existe
fetch(SUPABASE_URL + '/rest/v1/rpc/is_admin', {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
.then(response => {
  console.log('🔐 Teste da função is_admin:');
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('📄 Resposta:', data);
})
.catch(error => {
  console.error('❌ Erro ao testar is_admin:', error);
});

console.log('🧪 Execute este script no console do navegador (F12) para diagnosticar o problema');
