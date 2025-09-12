// Configurar dados de teste e enviar email
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function setupAndTest() {
  console.log('🚀 Configurando dados de teste e enviando email...\n');

  try {
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Content-Type': 'application/json'
    };

    // 1. Criar propriedade de teste
    console.log('1️⃣ Criando propriedade de teste...');
    const property = {
      name: 'Condomínio Residencial Teste',
      address: 'Rua das Flores, 123 - Centro',
      admin_name: 'Pedro Machado',
      admin_email: 'pedro.machado@tocaimoveis.com.br',
      admin_phone: '(11) 99999-9999'
    };

    const propResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/properties', {
      method: 'POST',
      headers,
      body: JSON.stringify(property)
    });

    let propertyId;
    if (propResponse.ok) {
      const createdProp = await propResponse.json();
      propertyId = createdProp[0].id;
      console.log('   ✅ Propriedade criada:', propertyId);
    } else {
      console.log('   ❌ Erro ao criar propriedade:', propResponse.status);
      const error = await propResponse.text();
      console.log('   Detalhes:', error);
      return;
    }

    // 2. Criar ocorrência de teste
    console.log('\n2️⃣ Criando ocorrência de teste...');
    const occurrence = {
      property_id: propertyId,
      title: 'Consulta de Débitos - Teste',
      description: 'Ocorrência criada para testar o sistema de emails com o texto solicitado',
      status: 'open',
      priority: 'medium',
      email_status: 'Não enviado'
    };

    const occResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences', {
      method: 'POST',
      headers,
      body: JSON.stringify(occurrence)
    });

    if (occResponse.ok) {
      const createdOcc = await occResponse.json();
      console.log('   ✅ Ocorrência criada:', createdOcc[0].id);
    } else {
      console.log('   ❌ Erro ao criar ocorrência:', occResponse.status);
      const error = await occResponse.text();
      console.log('   Detalhes:', error);
      return;
    }

    // 3. Testar envio de email
    console.log('\n3️⃣ Testando envio de email...');
    const emailResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-bulk-emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        limit: 1,
        testMode: false  // Modo produção para enviar email real
      })
    });

    if (emailResponse.ok) {
      const result = await emailResponse.json();
      console.log('   ✅ Email enviado com sucesso!');
      console.log('   📧 Resultado:', result);
    } else {
      console.log('   ❌ Erro ao enviar email:', emailResponse.status);
      const error = await emailResponse.text();
      console.log('   Detalhes:', error);
    }

    console.log('\n🎯 Resumo:');
    console.log('   📧 Email enviado para: pedro.machado@tocaimoveis.com.br');
    console.log('   📝 Texto usado: "Olá, boa tarde, tudo bem? Poderia por gentileza me informar se constam débitos..."');
    console.log('   🏢 Propriedade: Condomínio Residencial Teste');
    console.log('   📍 Endereço: Rua das Flores, 123 - Centro');
    console.log('   🔄 Recarregue /bulk-emails para ver o botão habilitado');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

setupAndTest();




