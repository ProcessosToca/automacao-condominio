const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Test 1: Basic connection
    console.log('\n1. Testando conexão básica...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão básica:', error);
    } else {
      console.log('✅ Conexão básica OK');
    }
    
    // Test 2: Check if profiles table exists and has correct structure
    console.log('\n2. Verificando estrutura da tabela profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError);
    } else {
      console.log('✅ Tabela profiles acessível');
      if (profiles && profiles.length > 0) {
        console.log('📋 Estrutura do primeiro registro:', Object.keys(profiles[0]));
      }
    }
    
    // Test 3: Test signup (this should fail gracefully)
    console.log('\n3. Testando signup (deve falhar graciosamente)...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signupError) {
      console.log('⚠️ Erro esperado no signup (usuário já existe ou validação):', signupError.message);
    } else {
      console.log('✅ Signup funcionou (pode ser um usuário de teste)');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
