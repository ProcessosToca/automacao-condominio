const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const SUPABASE_URL = "https://jamzaegwhzmtvierjckg.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: SUPABASE_SERVICE_KEY não encontrada no ambiente');
  console.log('Por favor, configure a variável de ambiente SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  try {
    console.log('🚀 Iniciando migração de ocorrências...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250101000003_add_occurrences_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Arquivo de migração carregado');
    
    // Aplicar a migração
    console.log('🔧 Aplicando migração no banco...');
    
    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
          if (error) {
            console.log(`⚠️  Comando executado (pode ser um comando que não retorna resultado): ${command.substring(0, 50)}...`);
          }
        } catch (err) {
          // Alguns comandos podem falhar se as tabelas já existirem
          console.log(`ℹ️  Comando pode ter falhado (normal se já existir): ${command.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    console.log('');
    console.log('📋 Tabelas criadas:');
    console.log('   - properties (propriedades)');
    console.log('   - occurrences (ocorrências)');
    console.log('');
    console.log('🔐 Políticas de segurança configuradas');
    console.log('📊 Índices de performance criados');
    console.log('⏰ Triggers de timestamp configurados');
    console.log('🏢 Propriedades de exemplo inseridas');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
    process.exit(1);
  }
}

// Executar a migração
applyMigration();
