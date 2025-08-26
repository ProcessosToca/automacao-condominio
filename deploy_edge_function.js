const fs = require('fs');
const path = require('path');

// Configurações do projeto
const PROJECT_REF = 'jamzaegwhzmtvierjckg';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDY4ODgsImV4cCI6MjA3MTcyMjg4OH0.04a89aa952e9f87c5ce75493fd3dbf8c3346117400e81b0d816688a8eec58efd23267b6d111aba2746c8115b0a98f3b4167f6a131c13c4658190ed9eeb4739abc8';

// Função para fazer deploy da Edge Function
async function deployEdgeFunction() {
  try {
    console.log('🚀 Iniciando deploy da Edge Function...');
    
    // Ler o arquivo da Edge Function
    const functionPath = path.join(__dirname, 'supabase', 'functions', 'send-password-reset', 'index.ts');
    const functionCode = fs.readFileSync(functionPath, 'utf8');
    
    console.log('📁 Arquivo da função lido com sucesso');
    
    // Fazer deploy via API do Supabase
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-password-reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: functionCode,
        name: 'send-password-reset'
      })
    });
    
    if (response.ok) {
      console.log('✅ Edge Function deployada com sucesso!');
      console.log('🔗 URL: https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-password-reset');
    } else {
      const error = await response.text();
      console.error('❌ Erro no deploy:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar o deploy
deployEdgeFunction();
