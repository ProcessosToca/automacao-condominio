// Verificar dados no banco
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkData() {
  try {
    console.log('🔍 Verificando dados no banco...\n');
    
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
    };
    
    // 1. Verificar ocorrências
    console.log('1️⃣ Verificando ocorrências...');
    const occResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences?select=id,email_status', {
      headers
    });
    
    if (!occResponse.ok) {
      console.log('❌ Erro ao buscar ocorrências:', occResponse.status);
      const error = await occResponse.text();
      console.log('   Detalhes:', error);
    } else {
      const occurrences = await occResponse.json();
      console.log('   📊 Total de ocorrências:', occurrences.length);
      
      if (occurrences.length > 0) {
        const statusCount = {};
        occurrences.forEach(occ => {
          const status = occ.email_status || 'null';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        console.log('   📈 Status:', statusCount);
      }
    }
    
    // 2. Verificar propriedades
    console.log('\n2️⃣ Verificando propriedades...');
    const propResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/properties?select=id,name,admin_email', {
      headers
    });
    
    if (!propResponse.ok) {
      console.log('❌ Erro ao buscar propriedades:', propResponse.status);
      const error = await propResponse.text();
      console.log('   Detalhes:', error);
    } else {
      const properties = await propResponse.json();
      console.log('   🏢 Total de propriedades:', properties.length);
      
      const withEmail = properties.filter(p => p.admin_email);
      console.log('   📧 Com email configurado:', withEmail.length);
      
      if (withEmail.length > 0) {
        console.log('   📋 Propriedades com email:');
        withEmail.forEach(p => console.log(`      - ${p.name}: ${p.admin_email}`));
      }
    }
    
    // 3. Verificar ocorrências elegíveis
    console.log('\n3️⃣ Verificando ocorrências elegíveis...');
    const eligibleResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/occurrences?select=id,title,properties!inner(name,admin_email)&properties.admin_email=not.is.null', {
      headers
    });
    
    if (!eligibleResponse.ok) {
      console.log('❌ Erro ao buscar ocorrências elegíveis:', eligibleResponse.status);
    } else {
      const eligible = await eligibleResponse.json();
      console.log('   📬 Ocorrências elegíveis para email:', eligible.length);
      
      if (eligible.length > 0) {
        console.log('   📋 Exemplos:');
        eligible.slice(0, 3).forEach(occ => {
          console.log(`      - ${occ.id}: ${occ.title} → ${occ.properties.admin_email}`);
        });
      }
    }
    
    console.log('\n🎯 Diagnóstico:');
    if (occurrences && occurrences.length === 0) {
      console.log('   ❌ Não há ocorrências no banco');
    } else if (properties && properties.filter(p => p.admin_email).length === 0) {
      console.log('   ❌ Não há propriedades com email configurado');
    } else {
      console.log('   ✅ Dados encontrados - botão deve estar habilitado');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkData();




