// Script de teste para verificar o sistema de gerenciamento de usuários
// Execute este script no console do navegador após fazer login como admin

console.log('🔍 Testando sistema de gerenciamento de usuários...');

// Função para testar se o usuário atual é admin
function testIsAdmin() {
  const user = JSON.parse(localStorage.getItem('app_user') || '{}');
  console.log('👤 Usuário atual:', user);
  console.log('🔑 É admin?', user.role === 'admin');
  return user.role === 'admin';
}

// Função para testar a chamada da API
async function testGetAllUsers() {
  try {
    console.log('📡 Testando getAllUsers...');
    
    // Simular chamada da função getAllUsers
    const response = await fetch('/api/test-get-all-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: JSON.parse(localStorage.getItem('app_user') || '{}')
      })
    });
    
    const data = await response.json();
    console.log('📊 Resposta:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao testar getAllUsers:', error);
    return null;
  }
}

// Função para verificar se as funções SQL existem
function checkSQLFunctions() {
  console.log('🔧 Verificando funções SQL...');
  console.log('ℹ️  Para verificar se as funções SQL foram criadas:');
  console.log('1. Acesse o Supabase Dashboard');
  console.log('2. Vá para Database > Functions');
  console.log('3. Procure por: get_all_users, get_user_by_id, update_user_by_admin');
}

// Função para verificar usuários no banco
function checkUsersInDatabase() {
  console.log('👥 Para verificar usuários no banco, execute no SQL Editor:');
  console.log(`
SELECT 
  user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
WHERE is_active = true
ORDER BY created_at DESC;
  `);
}

// Executar testes
function runTests() {
  console.log('🚀 Iniciando testes...\n');
  
  // Teste 1: Verificar se é admin
  const isAdmin = testIsAdmin();
  
  if (!isAdmin) {
    console.log('❌ Usuário não é admin. Faça login como administrador.');
    return;
  }
  
  console.log('✅ Usuário é admin!\n');
  
  // Teste 2: Verificar funções SQL
  checkSQLFunctions();
  console.log('');
  
  // Teste 3: Verificar usuários no banco
  checkUsersInDatabase();
  console.log('');
  
  // Teste 4: Verificar se a página está acessível
  console.log('🌐 Para testar a página de gerenciamento:');
  console.log('1. Acesse: http://localhost:8080/users');
  console.log('2. Verifique se a lista de usuários aparece');
  console.log('3. Teste editar um usuário não-admin');
  
  console.log('\n📋 Checklist:');
  console.log('□ Funções SQL aplicadas no Supabase');
  console.log('□ Usuário logado é admin');
  console.log('□ Existem usuários na tabela profiles');
  console.log('□ Página /users carrega corretamente');
  console.log('□ Lista de usuários é exibida');
  console.log('□ Botão "Editar" funciona para usuários não-admin');
}

// Executar testes automaticamente
runTests();

// Exportar funções para uso manual
window.testUserManagement = {
  testIsAdmin,
  testGetAllUsers,
  checkSQLFunctions,
  checkUsersInDatabase,
  runTests
};

console.log('\n💡 Para executar testes manualmente, use:');
console.log('window.testUserManagement.runTests()');
