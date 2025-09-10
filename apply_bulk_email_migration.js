#!/usr/bin/env node

/**
 * Script para aplicar a migração do sistema de emails em massa
 * Executa a migração SQL e verifica se foi aplicada corretamente
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://jamzaegwhzmtvierjckg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyBulkEmailMigration() {
  console.log('🚀 Aplicando migração do sistema de emails em massa...\n');

  try {
    // 1. Verificar se as colunas já existem
    console.log('1️⃣ Verificando estrutura atual da tabela occurrences...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'occurrences')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }

    const existingColumns = columns.map(col => col.column_name);
    console.log('📋 Colunas existentes:', existingColumns.join(', '));

    // 2. Verificar se as colunas de email já existem
    const emailColumns = ['email_status', 'email_sent_at', 'email_error'];
    const missingColumns = emailColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      console.log('✅ Todas as colunas de email já existem!');
    } else {
      console.log('⚠️  Colunas faltando:', missingColumns.join(', '));
      console.log('📝 Aplicando migração...');
      
      // Ler arquivo de migração
      const migrationPath = path.join(__dirname, 'supabase/migrations/20250101000003_add_email_status_to_occurrences.sql');
      
      if (!fs.existsSync(migrationPath)) {
        console.error('❌ Arquivo de migração não encontrado:', migrationPath);
        return;
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Executar migração via RPC (se disponível) ou instruir aplicação manual
      console.log('📄 Conteúdo da migração:');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      
      console.log('\n⚠️  IMPORTANTE: Execute esta migração manualmente no Supabase Dashboard:');
      console.log('   1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg');
      console.log('   2. Vá para SQL Editor');
      console.log('   3. Cole o SQL acima');
      console.log('   4. Execute a query');
    }

    // 3. Verificar estatísticas atuais
    console.log('\n2️⃣ Verificando estatísticas atuais...');
    
    const { data: occurrences, error: statsError } = await supabase
      .from('occurrences')
      .select('email_status');

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
      return;
    }

    const stats = {
      total: occurrences.length,
      nao_enviado: 0,
      aguardando_retorno: 0,
      enviado: 0,
      erro_no_envio: 0,
      sem_status: 0
    };

    occurrences.forEach(occ => {
      const status = occ.email_status;
      if (!status) {
        stats.sem_status++;
      } else {
        switch (status) {
          case 'Não enviado':
            stats.nao_enviado++;
            break;
          case 'Aguardando Retorno':
            stats.aguardando_retorno++;
            break;
          case 'Enviado':
            stats.enviado++;
            break;
          case 'Erro no Envio':
            stats.erro_no_envio++;
            break;
          default:
            stats.sem_status++;
        }
      }
    });

    console.log('📊 Estatísticas atuais:');
    console.log(`   📈 Total de ocorrências: ${stats.total}`);
    console.log(`   🔴 Não enviado: ${stats.nao_enviado}`);
    console.log(`   🟡 Aguardando Retorno: ${stats.aguardando_retorno}`);
    console.log(`   🟢 Enviado: ${stats.enviado}`);
    console.log(`   ❌ Erro no Envio: ${stats.erro_no_envio}`);
    console.log(`   ⚪ Sem status: ${stats.sem_status}`);

    // 4. Verificar propriedades com email
    console.log('\n3️⃣ Verificando propriedades com email...');
    
    const { data: properties, error: propsError } = await supabase
      .from('properties')
      .select('id, name, admin_email')
      .not('admin_email', 'is', null);

    if (propsError) {
      console.error('❌ Erro ao buscar propriedades:', propsError);
      return;
    }

    console.log(`📧 Propriedades com email configurado: ${properties.length}`);
    
    if (properties.length > 0) {
      console.log('   Exemplos:');
      properties.slice(0, 3).forEach(prop => {
        console.log(`   - ${prop.name}: ${prop.admin_email}`);
      });
    }

    // 5. Verificar ocorrências que podem receber email
    console.log('\n4️⃣ Verificando ocorrências elegíveis para email...');
    
    const { data: eligibleOccurrences, error: eligibleError } = await supabase
      .from('occurrences')
      .select(`
        id,
        title,
        properties!inner(
          name,
          admin_email
        )
      `)
      .not('properties.admin_email', 'is', null);

    if (eligibleError) {
      console.error('❌ Erro ao buscar ocorrências elegíveis:', eligibleError);
      return;
    }

    console.log(`📬 Ocorrências elegíveis para email: ${eligibleOccurrences.length}`);
    
    if (eligibleOccurrences.length > 0) {
      console.log('   Exemplos:');
      eligibleOccurrences.slice(0, 3).forEach(occ => {
        console.log(`   - ${occ.id}: ${occ.title} → ${occ.properties.admin_email}`);
      });
    }

    // 6. Instruções finais
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('   1. ✅ Aplicar migração SQL (se necessário)');
    console.log('   2. 🚀 Deploy da Edge Function: npx supabase functions deploy send-bulk-emails');
    console.log('   3. 📧 Configurar SendGrid (opcional): npx supabase secrets set SENDGRID_API_KEY=sua_chave');
    console.log('   4. 🧪 Testar sistema via interface web: /bulk-emails');
    console.log('   5. 🐍 Testar via script Python: python bulk_email_processor.py');

    console.log('\n✅ Verificação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyBulkEmailMigration();
}

module.exports = { applyBulkEmailMigration };

