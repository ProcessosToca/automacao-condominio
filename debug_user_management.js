// Script de debug para verificar o problema
// Execute no console do navegador

console.log('🔍 Debugando problema de gerenciamento de usuários...');

// 1. Verificar usuário atual
const user = JSON.parse(localStorage.getItem('app_user') || '{}');
console.log('👤 Usuário atual:', user);
console.log('🔑 É admin?', user.role === 'admin');

// 2. Verificar se as funções existem
async function checkFunctions() {
  try {
    console.log('🔧 Verificando funções SQL...');
    
    // Testar função get_all_users
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/rpc/get_all_users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'sua_api_key_aqui', // Substitua pela sua API key
        'Authorization': 'Bearer sua_anon_key_aqui' // Substitua pela sua anon key
      }
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Função existe! Resposta:', data);
    } else {
      console.log('❌ Função não encontrada. Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar função:', error);
  }
}

// 3. Verificar usuários no banco
async function checkUsers() {
  try {
    console.log('👥 Verificando usuários no banco...');
    
    const response = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/profiles?select=*&is_active=eq.true', {
      headers: {
        'apikey': 'sua_api_key_aqui', // Substitua pela sua API key
        'Authorization': 'Bearer sua_anon_key_aqui' // Substitua pela sua anon key
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ Usuários encontrados:', users.length);
      console.log('📋 Lista de usuários:', users);
    } else {
      console.log('❌ Erro ao buscar usuários. Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  }
}

// 4. Executar verificações
async function runDebug() {
  console.log('🚀 Iniciando debug...\n');
  
  await checkFunctions();
  console.log('');
  
  await checkUsers();
  console.log('');
  
  console.log('📋 Checklist de verificação:');
  console.log('□ Script SQL foi executado no Supabase');
  console.log('□ Funções aparecem na lista de Database > Functions');
  console.log('□ Usuário logado é admin');
  console.log('□ Existem usuários na tabela profiles');
  console.log('□ API keys estão corretas');
}

// Executar debug
runDebug();

// Exportar para uso manual
window.debugUserManagement = {
  checkFunctions,
  checkUsers,
  runDebug
};
