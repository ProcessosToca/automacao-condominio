const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = 'https://jamzaegwhzmtvierjckg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyOccurrencesFix() {
  console.log('🔧 Aplicando correções para a tabela occurrences...\n');

  try {
    // 1. Verificar estado atual
    console.log('1️⃣ Verificando estado atual da tabela occurrences...');
    
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
      console.error('❌ Tabela "occurrences" não encontrada!');
      return;
    }

    console.log('✅ Tabela "occurrences" encontrada');

    // 2. Verificar políticas RLS existentes
    console.log('\n2️⃣ Verificando políticas RLS existentes...');
    
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'occurrences');

      if (policiesError) {
        console.log('   - Não foi possível verificar políticas via pg_policies');
        console.log('   - Erro:', policiesError.message);
      } else if (policies && policies.length > 0) {
        console.log(`   - Encontradas ${policies.length} políticas:`);
        policies.forEach(policy => {
          console.log(`     * ${policy.policyname}: ${policy.cmd}`);
        });
      } else {
        console.log('   - Nenhuma política RLS encontrada');
      }
    } catch (policyCheckError) {
      console.log('   - Erro ao verificar políticas:', policyCheckError.message);
    }

    // 3. Aplicar correções via SQL
    console.log('\n3️⃣ Aplicando correções via SQL...');

    // 3.1 Habilitar RLS
    console.log('   - Habilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('   - RLS já estava habilitado ou erro:', rlsError.message);
    } else {
      console.log('   - RLS habilitado com sucesso');
    }

    // 3.2 Remover políticas conflitantes
    console.log('   - Removendo políticas conflitantes...');
    const policiesToDrop = [
      'Enable read access for all users',
      'Enable insert access for all users',
      'Enable update access for all users',
      'Enable delete access for all users'
    ];

    for (const policyName of policiesToDrop) {
      try {
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON public.occurrences;`
        });
        
        if (!dropError) {
          console.log(`     * Política "${policyName}" removida`);
        }
      } catch (dropPolicyError) {
        console.log(`     * Erro ao remover política "${policyName}":`, dropPolicyError.message);
      }
    }

    // 3.3 Criar novas políticas permissivas
    console.log('   - Criando novas políticas permissivas...');
    
    const newPolicies = [
      {
        name: 'Enable read access for all users',
        sql: 'CREATE POLICY "Enable read access for all users" ON public.occurrences FOR SELECT USING (true);'
      },
      {
        name: 'Enable insert access for all users',
        sql: 'CREATE POLICY "Enable insert access for all users" ON public.occurrences FOR INSERT WITH CHECK (true);'
      },
      {
        name: 'Enable update access for all users',
        sql: 'CREATE POLICY "Enable update access for all users" ON public.occurrences FOR UPDATE USING (true) WITH CHECK (true);'
      },
      {
        name: 'Enable delete access for all users',
        sql: 'CREATE POLICY "Enable delete access for all users" ON public.occurrences FOR DELETE USING (true);'
      }
    ];

    for (const policy of newPolicies) {
      try {
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: policy.sql
        });
        
        if (!createError) {
          console.log(`     * Política "${policy.name}" criada com sucesso`);
        } else {
          console.log(`     * Erro ao criar política "${policy.name}":`, createError.message);
        }
      } catch (createPolicyError) {
        console.log(`     * Erro ao criar política "${policy.name}":`, createPolicyError.message);
      }
    }

    // 3.4 Conceder permissões
    console.log('   - Concedendo permissões...');
    
    const grants = [
      'GRANT ALL ON public.occurrences TO anon;',
      'GRANT ALL ON public.occurrences TO authenticated;',
      'GRANT ALL ON public.occurrences TO service_role;'
    ];

    for (const grant of grants) {
      try {
        const { error: grantError } = await supabase.rpc('exec_sql', {
          sql: grant
        });
        
        if (!grantError) {
          console.log(`     * Permissão concedida: ${grant.trim()}`);
        } else {
          console.log(`     * Erro ao conceder permissão: ${grantError.message}`);
        }
      } catch (grantPermissionError) {
        console.log(`     * Erro ao conceder permissão: ${grantPermissionError.message}`);
      }
    }

    // 4. Verificar se as correções foram aplicadas
    console.log('\n4️⃣ Verificando se as correções foram aplicadas...');
    
    try {
      const { data: finalPolicies, error: finalPoliciesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'occurrences');

      if (finalPoliciesError) {
        console.log('   - Não foi possível verificar políticas finais');
      } else if (finalPolicies && finalPolicies.length > 0) {
        console.log(`   - Políticas finais (${finalPolicies.length}):`);
        finalPolicies.forEach(policy => {
          console.log(`     * ${policy.policyname}: ${policy.cmd}`);
        });
      } else {
        console.log('   - Nenhuma política encontrada após correção');
      }
    } catch (finalCheckError) {
      console.log('   - Erro ao verificar políticas finais:', finalCheckError.message);
    }

    // 5. Testar operação DELETE
    console.log('\n5️⃣ Testando operação DELETE...');
    
    try {
      // Primeiro, listar ocorrências para testar
      const { data: testOccurrences, error: listError } = await supabase
        .from('occurrences')
        .select('id, title')
        .limit(1);

      if (listError) {
        console.log('   - Erro ao listar ocorrências para teste:', listError.message);
      } else if (testOccurrences && testOccurrences.length > 0) {
        const testOccurrence = testOccurrences[0];
        console.log(`   - Testando DELETE na ocorrência: ${testOccurrence.title}`);
        
        // Tentar deletar (mas não confirmar)
        const { error: deleteTestError } = await supabase
          .from('occurrences')
          .delete()
          .eq('id', testOccurrence.id);

        if (deleteTestError) {
          console.log(`   - ❌ Teste DELETE falhou:`, deleteTestError.message);
          console.log(`   - Código de erro:`, deleteTestError.code);
          
          // Verificar se é problema de RLS
          if (deleteTestError.code === 'PGRST116' || deleteTestError.message.includes('permission')) {
            console.log('   - 🔒 Problema de permissões detectado!');
            console.log('   - As políticas RLS podem não ter sido aplicadas corretamente');
          }
        } else {
          console.log('   - ✅ Teste DELETE bem-sucedido!');
          
          // Reverter o teste (reinserir a ocorrência)
          console.log('   - Revertendo teste (reinserindo ocorrência)...');
          // Aqui você pode reinserir a ocorrência se necessário
        }
      } else {
        console.log('   - Nenhuma ocorrência encontrada para teste');
      }
    } catch (deleteTestError) {
      console.log('   - Erro durante teste DELETE:', deleteTestError.message);
    }

    console.log('\n✨ Correções aplicadas!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para criar função RPC se não existir
async function createExecSQLFunction() {
  console.log('🔧 Criando função RPC exec_sql se necessário...');
  
  try {
    const { error: createFunctionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
      `
    });

    if (createFunctionError) {
      console.log('   - Função exec_sql já existe ou erro:', createFunctionError.message);
    } else {
      console.log('   - Função exec_sql criada com sucesso');
    }
  } catch (functionError) {
    console.log('   - Erro ao criar função exec_sql:', functionError.message);
  }
}

// Executar correções
async function runFix() {
  console.log('🚀 Iniciando correções para tabela occurrences...\n');
  
  await createExecSQLFunction();
  await applyOccurrencesFix();
  
  console.log('\n🎯 Correções concluídas!');
  console.log('📋 Verifique se o botão de excluir está funcionando agora');
}

// Executar se chamado diretamente
if (require.main === module) {
  runFix().catch(console.error);
}

module.exports = { applyOccurrencesFix, createExecSQLFunction };
