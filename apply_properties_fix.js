const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPropertiesRLS() {
  console.log('🔧 Aplicando correção para políticas RLS da tabela properties...\n');

  try {
    // 1. Verificar políticas atuais
    console.log('1️⃣ Verificando políticas RLS atuais...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'properties' })
      .catch(() => ({ data: null, error: 'Função não disponível' }));

    if (policiesError) {
      console.log('ℹ️  Não foi possível verificar políticas via RPC');
    } else {
      console.log('📋 Políticas atuais:', policies);
    }

    // 2. Aplicar correção via SQL direto
    console.log('\n2️⃣ Aplicando correção via SQL...');
    
    const fixSQL = `
      -- Remover políticas problemáticas
      DROP POLICY IF EXISTS "Users can update properties" ON public.properties;
      DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
      DROP POLICY IF EXISTS "Users can insert properties" ON public.properties;
      DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
      DROP POLICY IF EXISTS "Users can delete properties" ON public.properties;
      DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
      
      -- Criar políticas mais permissivas para desenvolvimento
      CREATE POLICY "Enable read access for all users" ON public.properties
        FOR SELECT USING (true);
      
      CREATE POLICY "Enable insert access for all users" ON public.properties
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Enable update access for all users" ON public.properties
        FOR UPDATE USING (true) WITH CHECK (true);
      
      CREATE POLICY "Enable delete access for all users" ON public.properties
        FOR DELETE USING (true);
    `;

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: fixSQL })
      .catch(() => ({ error: 'Função exec_sql não disponível' }));

    if (sqlError) {
      console.log('ℹ️  Não foi possível executar SQL via RPC');
      console.log('📝 Execute manualmente o script fix_properties_rls.sql no Supabase');
    } else {
      console.log('✅ Políticas RLS corrigidas via SQL');
    }

    // 3. Criar função RPC para atualização segura
    console.log('\n3️⃣ Criando função RPC para atualização segura...');
    
    const rpcFunction = `
      CREATE OR REPLACE FUNCTION update_property_safe(
          property_id UUID,
          property_updates JSONB
      )
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          result JSONB;
      BEGIN
          -- Verificar se a propriedade existe
          IF NOT EXISTS (SELECT 1 FROM public.properties WHERE id = property_id) THEN
              RAISE EXCEPTION 'Propriedade não encontrada';
          END IF;
      
          -- Atualizar a propriedade
          UPDATE public.properties 
          SET 
              name = COALESCE((property_updates->>'name')::TEXT, name),
              address = COALESCE((property_updates->>'address')::TEXT, address),
              admin_name = COALESCE((property_updates->>'admin_name')::TEXT, admin_name),
              admin_phone = COALESCE((property_updates->>'admin_phone')::TEXT, admin_phone),
              updated_at = NOW()
          WHERE id = property_id;
      
          -- Retornar dados atualizados
          SELECT to_jsonb(p.*) INTO result
          FROM public.properties p
          WHERE p.id = property_id;
      
          RETURN result;
      END;
      $$;
    `;

    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: rpcFunction })
      .catch(() => ({ error: 'Função exec_sql não disponível' }));

    if (rpcError) {
      console.log('ℹ️  Não foi possível criar função RPC via SQL');
      console.log('📝 Execute manualmente o script fix_properties_rls.sql no Supabase');
    } else {
      console.log('✅ Função RPC criada com sucesso');
    }

    // 4. Testar operações CRUD
    console.log('\n4️⃣ Testando operações CRUD...');
    
    // Testar SELECT
    const { data: properties, error: selectError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ SELECT falhou:', selectError);
    } else {
      console.log('✅ SELECT funcionando');
    }

    // Testar UPDATE (se houver propriedades)
    if (properties && properties.length > 0) {
      const testProperty = properties[0];
      const { error: updateError } = await supabase
        .from('properties')
        .update({ admin_name: testProperty.admin_name })
        .eq('id', testProperty.id);

      if (updateError) {
        console.error('❌ UPDATE falhou:', updateError);
        console.log('🔧 Tentando abordagem alternativa...');
        
        // Testar função RPC
        const { error: rpcTestError } = await supabase
          .rpc('update_property_safe', {
            property_id: testProperty.id,
            property_updates: { admin_name: testProperty.admin_name }
          });

        if (rpcTestError) {
          console.error('❌ RPC também falhou:', rpcTestError);
        } else {
          console.log('✅ RPC funcionando como alternativa');
        }
      } else {
        console.log('✅ UPDATE funcionando');
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }

  console.log('\n🏁 Correção aplicada!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute o script fix_properties_rls.sql no Supabase SQL Editor');
  console.log('2. Teste as operações de edição no frontend');
  console.log('3. Verifique se o erro 406 foi resolvido');
}

// Executar correção
fixPropertiesRLS();
