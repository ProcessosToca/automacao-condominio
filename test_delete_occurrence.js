const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = 'https://jamzaegwhzmtvierjckg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeleteOccurrence() {
  console.log('🔍 Testando exclusão de ocorrências...\n');

  try {
    // 1. Verificar se conseguimos conectar
    console.log('1️⃣ Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('occurrences')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // 2. Listar ocorrências existentes
    console.log('2️⃣ Listando ocorrências existentes...');
    const { data: occurrences, error: listError } = await supabase
      .from('occurrences')
      .select('*')
      .limit(5);

    if (listError) {
      console.error('❌ Erro ao listar ocorrências:', listError);
      return;
    }

    if (!occurrences || occurrences.length === 0) {
      console.log('⚠️ Nenhuma ocorrência encontrada para testar');
      return;
    }

    console.log(`✅ Encontradas ${occurrences.length} ocorrências:`);
    occurrences.forEach((occ, index) => {
      console.log(`   ${index + 1}. ID: ${occ.id} | Título: ${occ.title}`);
    });

    // 3. Testar exclusão da primeira ocorrência
    const occurrenceToDelete = occurrences[0];
    console.log(`\n3️⃣ Testando exclusão da ocorrência: ${occurrenceToDelete.title}`);
    
    const { error: deleteError } = await supabase
      .from('occurrences')
      .delete()
      .eq('id', occurrenceToDelete.id);

    if (deleteError) {
      console.error('❌ Erro ao deletar ocorrência:', deleteError);
      
      // Verificar se é problema de RLS
      if (deleteError.code === 'PGRST116' || deleteError.message.includes('permission')) {
        console.log('\n🔒 Problema de permissões detectado!');
        console.log('   - Verificando políticas RLS...');
        
        // Verificar políticas RLS
        const { data: policies, error: policyError } = await supabase
          .rpc('get_policies', { table_name: 'occurrences' });
        
        if (policyError) {
          console.log('   - Não foi possível verificar políticas RLS');
        } else {
          console.log('   - Políticas RLS encontradas:', policies);
        }
      }
      
      return;
    }

    console.log('✅ Ocorrência deletada com sucesso!');

    // 4. Verificar se foi realmente deletada
    console.log('\n4️⃣ Verificando se a ocorrência foi deletada...');
    const { data: checkData, error: checkError } = await supabase
      .from('occurrences')
      .select('*')
      .eq('id', occurrenceToDelete.id);

    if (checkError) {
      console.error('❌ Erro ao verificar exclusão:', checkError);
      return;
    }

    if (!checkData || checkData.length === 0) {
      console.log('✅ Confirmação: Ocorrência foi realmente removida do banco');
    } else {
      console.log('⚠️ A ocorrência ainda existe no banco após tentativa de exclusão');
    }

    // 5. Verificar políticas RLS
    console.log('\n5️⃣ Verificando políticas RLS da tabela occurrences...');
    try {
      const { data: rlsInfo, error: rlsError } = await supabase
        .rpc('check_rls_policies', { table_name: 'occurrences' });
      
      if (rlsError) {
        console.log('   - Não foi possível verificar RLS via RPC');
        console.log('   - Tentando verificar via query direta...');
        
        // Query alternativa para verificar RLS
        const { data: rlsData, error: rlsQueryError } = await supabase
          .from('information_schema.tables')
          .select('is_insertable_into')
          .eq('table_name', 'occurrences')
          .eq('table_schema', 'public');
        
        if (!rlsQueryError && rlsData && rlsData.length > 0) {
          console.log('   - Informações da tabela:', rlsData[0]);
        }
      } else {
        console.log('   - Informações RLS:', rlsInfo);
      }
    } catch (rlsCheckError) {
      console.log('   - Erro ao verificar RLS:', rlsCheckError.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function checkTableStructure() {
  console.log('\n🔍 Verificando estrutura da tabela occurrences...\n');

  try {
    // Verificar se a tabela existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'occurrences')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }

    if (!tableInfo || tableInfo.length === 0) {
      console.log('❌ Tabela "occurrences" não encontrada!');
      return;
    }

    console.log('✅ Tabela "occurrences" encontrada');
    console.log('   - Schema:', tableInfo[0].table_schema);
    console.log('   - Nome:', tableInfo[0].table_name);
    console.log('   - Tipo:', tableInfo[0].table_type);

    // Verificar colunas
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'occurrences')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }

    console.log('\n📋 Colunas da tabela:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    // Verificar constraints
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'occurrences')
      .eq('table_schema', 'public');

    if (!constraintsError && constraints) {
      console.log('\n🔒 Constraints da tabela:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  }
}

async function checkRLSPolicies() {
  console.log('\n🔍 Verificando políticas RLS...\n');

  try {
    // Verificar se RLS está habilitado
    const { data: rlsEnabled, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('is_insertable_into')
      .eq('table_name', 'occurrences')
      .eq('table_schema', 'public');

    if (rlsError) {
      console.error('❌ Erro ao verificar RLS:', rlsError);
      return;
    }

    if (rlsEnabled && rlsEnabled.length > 0) {
      const table = rlsEnabled[0];
      console.log('📊 Permissões da tabela:');
      console.log(`   - Inserção: ${table.is_insertable_into === 'YES' ? '✅ Permitida' : '❌ Negada'}`);
      console.log(`   - Atualização: ✅ Verificar via políticas RLS`);
      console.log(`   - Exclusão: ✅ Verificar via políticas RLS`);
    }

    // Tentar verificar políticas via query SQL
    console.log('\n🔍 Tentando verificar políticas RLS via SQL...');
    
    // Query para verificar se há políticas RLS
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'occurrences' });
    
    if (policiesError) {
      console.log('   - Não foi possível verificar políticas via RPC');
      console.log('   - Erro:', policiesError.message);
      
      // Tentar query alternativa
      console.log('   - Tentando query alternativa...');
      const { data: altPolicies, error: altError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'occurrences');
      
      if (altError) {
        console.log('   - Query alternativa também falhou:', altError.message);
      } else if (altPolicies && altPolicies.length > 0) {
        console.log('   - Políticas encontradas:', altPolicies.length);
        altPolicies.forEach(policy => {
          console.log(`     * ${policy.policyname}: ${policy.cmd} para ${policy.roles}`);
        });
      } else {
        console.log('   - Nenhuma política RLS encontrada');
      }
    } else {
      console.log('   - Políticas encontradas:', policies);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar políticas RLS:', error);
  }
}

// Executar testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de exclusão de ocorrências...\n');
  
  await testDeleteOccurrence();
  await checkTableStructure();
  await checkRLSPolicies();
  
  console.log('\n✨ Testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testDeleteOccurrence, checkTableStructure, checkRLSPolicies };
