// Criar dados de teste para habilitar o botão
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestData() {
  console.log('🧪 Criando dados de teste...\n');

  try {
    // Usar a chave que sabemos que funciona
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Content-Type': 'application/json'
    };

    // 1. Verificar se já existem propriedades
    console.log('1️⃣ Verificando propriedades existentes...');
    const propResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/properties?select=id,name,admin_email', {
      headers
    });

    let properties = [];
    if (propResponse.ok) {
      properties = await propResponse.json();
      console.log(`   📊 Propriedades encontradas: ${properties.length}`);
    } else {
      console.log('   ❌ Erro ao buscar propriedades:', propResponse.status);
    }

    // 2. Criar propriedade de teste se não existir
    if (properties.length === 0) {
      console.log('\n2️⃣ Criando propriedade de teste...');
      const newProp = {
        name: 'Condomínio Teste',
        address: 'Rua Teste, 123 - Centro',
        admin_name: 'Pedro Machado',
        admin_email: 'pedro.machado@tocaimoveis.com.br',
        admin_phone: '(11) 99999-9999'
      };

      const createPropResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/properties', {
        method: 'POST',
        headers,
        body: JSON.stringify(newProp)
      });

      if (createPropResponse.ok) {
        const createdProp = await createPropResponse.json();
        console.log('   ✅ Propriedade criada:', createdProp[0].id);
        properties = [createdProp[0]];
      } else {
        console.log('   ❌ Erro ao criar propriedade:', createPropResponse.status);
        const error = await createPropResponse.text();
        console.log('   Detalhes:', error);
      }
    } else {
      // Atualizar primeira propriedade com email de teste
      console.log('\n2️⃣ Atualizando propriedade existente...');
      const firstProp = properties[0];
      const updateData = {
        admin_email: 'pedro.machado@tocaimoveis.com.br',
        admin_name: 'Pedro Machado'
      };

      const updateResponse = await fetch(`https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/properties?id=eq.${firstProp.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('   ✅ Propriedade atualizada com email de teste');
      } else {
        console.log('   ❌ Erro ao atualizar propriedade:', updateResponse.status);
      }
    }

    // 3. Verificar ocorrências
    console.log('\n3️⃣ Verificando ocorrências...');
    const occResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences?select=id,title,property_id,email_status', {
      headers
    });

    let occurrences = [];
    if (occResponse.ok) {
      occurrences = await occResponse.json();
      console.log(`   📊 Ocorrências encontradas: ${occurrences.length}`);
    } else {
      console.log('   ❌ Erro ao buscar ocorrências:', occResponse.status);
    }

    // 4. Criar ocorrência de teste se não existir
    if (occurrences.length === 0 && properties.length > 0) {
      console.log('\n4️⃣ Criando ocorrência de teste...');
      const newOcc = {
        property_id: properties[0].id,
        title: 'Teste de Email',
        description: 'Ocorrência criada para testar o sistema de emails',
        status: 'open',
        priority: 'medium',
        email_status: 'Não enviado'
      };

      const createOccResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences', {
        method: 'POST',
        headers,
        body: JSON.stringify(newOcc)
      });

      if (createOccResponse.ok) {
        const createdOcc = await createOccResponse.json();
        console.log('   ✅ Ocorrência criada:', createdOcc[0].id);
      } else {
        console.log('   ❌ Erro ao criar ocorrência:', createOccResponse.status);
        const error = await createOccResponse.text();
        console.log('   Detalhes:', error);
      }
    } else if (occurrences.length > 0) {
      // Atualizar primeira ocorrência para status "Não enviado"
      console.log('\n4️⃣ Atualizando ocorrência existente...');
      const firstOcc = occurrences[0];
      const updateData = {
        email_status: 'Não enviado'
      };

      const updateResponse = await fetch(`https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences?id=eq.${firstOcc.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log('   ✅ Ocorrência atualizada para "Não enviado"');
      } else {
        console.log('   ❌ Erro ao atualizar ocorrência:', updateResponse.status);
      }
    }

    console.log('\n🎯 Dados de teste criados!');
    console.log('   📧 Email de teste: pedro.machado@tocaimoveis.com.br');
    console.log('   🔄 Recarregue a página /bulk-emails');
    console.log('   ✅ O botão "Iniciar Processamento" deve estar habilitado');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createTestData();




