// Script para importar dados da planilha para o banco de dados
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class SpreadsheetImporter {
  constructor() {
    this.supabaseUrl = 'https://jamzaegwhzmtvierjckg.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
    this.headers = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Buscar dados da planilha do Google Sheets
  async fetchSpreadsheetData() {
    console.log('📊 Buscando dados da planilha...');
    
    const sheetId = '1feuzsTzqNnxiZvqHsF6RiYBmxhKjrq8dwP946rySuuI';
    const gid = '130052127';
    
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao acessar planilha: ${response.status}`);
      }
      
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      console.error('❌ Erro ao buscar planilha:', error.message);
      throw error;
    }
  }

  // Parse do CSV
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Planilha vazia');
    }

    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    console.log(`📋 Headers encontrados: ${headers.join(', ')}`);
    console.log(`📊 Linhas de dados: ${rows.length}`);

    return { headers, rows };
  }

  // Mapear dados da planilha para o formato do banco
  mapRowToDatabase(headers, row) {
    const data = {};
    
    // Mapear cada coluna da planilha para o campo correspondente no banco
    headers.forEach((header, index) => {
      const value = row[index] || '';
      const cleanHeader = header.toLowerCase().trim();
      
      // Mapeamento flexível baseado no nome da coluna
      if (cleanHeader.includes('numero') || cleanHeader.includes('número')) {
        data.numero_ocorrencia = value;
      } else if (cleanHeader.includes('titulo') || cleanHeader.includes('título')) {
        data.titulo = value;
      } else if (cleanHeader.includes('descricao') || cleanHeader.includes('descrição')) {
        data.descricao = value;
      } else if (cleanHeader.includes('status')) {
        data.status = value;
      } else if (cleanHeader.includes('prioridade')) {
        data.prioridade = value;
      } else if (cleanHeader.includes('edificio') || cleanHeader.includes('edifício')) {
        data.edificio = value;
      } else if (cleanHeader.includes('endereco') || cleanHeader.includes('endereço')) {
        data.endereco = value;
      } else if (cleanHeader.includes('numero') && !cleanHeader.includes('ocorrencia')) {
        data.numero = value;
      } else if (cleanHeader.includes('complemento')) {
        data.complemento = value;
      } else if (cleanHeader.includes('admin') && cleanHeader.includes('nome')) {
        data.admin_nome = value;
      } else if (cleanHeader.includes('admin') && cleanHeader.includes('email')) {
        data.admin_email = value;
      } else if (cleanHeader.includes('admin') && cleanHeader.includes('telefone')) {
        data.admin_telefone = value;
      } else if (cleanHeader.includes('coletor') && cleanHeader.includes('responsavel')) {
        data.coletor_responsavel = value;
      } else if (cleanHeader.includes('coletor') && cleanHeader.includes('telefone')) {
        data.coletor_telefone = value;
      } else if (cleanHeader.includes('valor') || cleanHeader.includes('debito')) {
        data.valor_debito = value ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : null;
      } else if (cleanHeader.includes('vencimento')) {
        data.data_vencimento = value ? new Date(value).toISOString().split('T')[0] : null;
      } else if (cleanHeader.includes('situacao') || cleanHeader.includes('situação')) {
        data.situacao_pagamento = value;
      } else if (cleanHeader.includes('data') && cleanHeader.includes('ocorrencia')) {
        data.data_ocorrencia = value ? new Date(value).toISOString().split('T')[0] : null;
      } else if (cleanHeader.includes('observacoes') || cleanHeader.includes('observações')) {
        data.observacoes = value;
      }
    });

    return data;
  }

  // Limpar dados existentes
  async clearExistingData() {
    console.log('🗑️ Limpando dados existentes...');
    
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/spreadsheet_data`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (response.ok) {
        console.log('✅ Dados existentes removidos');
      } else {
        console.log('⚠️ Erro ao limpar dados existentes:', response.status);
      }
    } catch (error) {
      console.log('⚠️ Erro ao limpar dados:', error.message);
    }
  }

  // Importar dados para o banco
  async importData() {
    try {
      console.log('🚀 Iniciando importação de dados da planilha...\n');

      // 1. Buscar dados da planilha
      const { headers, rows } = await this.fetchSpreadsheetData();

      // 2. Limpar dados existentes (opcional)
      await this.clearExistingData();

      // 3. Processar e importar cada linha
      console.log('\n📥 Importando dados...');
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        try {
          const rowData = this.mapRowToDatabase(headers, rows[i]);
          
          // Adicionar dados de controle
          rowData.processado = false;
          rowData.data_cadastro = new Date().toISOString();

          const response = await fetch(`${this.supabaseUrl}/rest/v1/spreadsheet_data`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(rowData)
          });

          if (response.ok) {
            successCount++;
            if (successCount % 10 === 0) {
              console.log(`   ✅ ${successCount} registros importados...`);
            }
          } else {
            errorCount++;
            const error = await response.text();
            console.log(`   ❌ Erro na linha ${i + 1}:`, error);
          }
        } catch (error) {
          errorCount++;
          console.log(`   ❌ Erro na linha ${i + 1}:`, error.message);
        }
      }

      console.log('\n🎯 Importação concluída!');
      console.log(`   ✅ Sucessos: ${successCount}`);
      console.log(`   ❌ Erros: ${errorCount}`);
      console.log(`   📊 Total: ${rows.length}`);

      // 4. Mostrar estatísticas
      await this.showStatistics();

    } catch (error) {
      console.error('❌ Erro na importação:', error.message);
    }
  }

  // Mostrar estatísticas dos dados importados
  async showStatistics() {
    try {
      console.log('\n📊 Estatísticas dos dados importados:');
      
      const response = await fetch(`${this.supabaseUrl}/rest/v1/spreadsheet_data?select=*`, {
        headers: this.headers
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log(`   📋 Total de registros: ${data.length}`);
        
        // Contar por status
        const statusCount = {};
        const edificioCount = {};
        
        data.forEach(item => {
          statusCount[item.status || 'Sem status'] = (statusCount[item.status || 'Sem status'] || 0) + 1;
          edificioCount[item.edificio || 'Sem edifício'] = (edificioCount[item.edificio || 'Sem edifício'] || 0) + 1;
        });

        console.log('\n   📈 Por status:');
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`      ${status}: ${count}`);
        });

        console.log('\n   🏢 Por edifício:');
        Object.entries(edificioCount).forEach(([edificio, count]) => {
          console.log(`      ${edificio}: ${count}`);
        });

        // Mostrar alguns exemplos
        console.log('\n   📋 Exemplos de dados importados:');
        data.slice(0, 3).forEach((item, index) => {
          console.log(`      ${index + 1}. ${item.numero_ocorrencia} - ${item.titulo} (${item.edificio})`);
        });

      } else {
        console.log('   ❌ Erro ao buscar estatísticas:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Erro ao gerar estatísticas:', error.message);
    }
  }
}

// Executar importação
async function main() {
  const importer = new SpreadsheetImporter();
  await importer.importData();
}

main();

