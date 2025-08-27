const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testSignup() {
  console.log('🔍 Testando signup...');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    console.log(`\n1. Tentando signup com email: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '123456789'
        }
      }
    });
    
    if (error) {
      console.error('❌ Erro no signup:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('✅ Signup realizado com sucesso!');
      console.log('Dados retornados:', data);
      
      // Verificar se o profile foi criado
      if (data.user) {
        console.log('\n2. Verificando se o profile foi criado...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Erro ao buscar profile:', profileError);
        } else {
          console.log('✅ Profile criado com sucesso:', profile);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testSignup();
