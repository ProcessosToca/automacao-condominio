// Script para criar a tabela spreadsheet_data via API REST
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createSpreadsheetTable() {
  console.log('🚀 Criando tabela spreadsheet_data...\n');

  try {
    const headers = {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8',
      'Content-Type': 'application/json'
    };

    // SQL da migração
    const migrationSQL = `
-- Criar tabela para armazenar dados da planilha de ocorrências
CREATE TABLE public.spreadsheet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados básicos da ocorrência
  numero_ocorrencia TEXT,
  titulo TEXT,
  descricao TEXT,
  status TEXT,
  prioridade TEXT,
  
  -- Dados do imóvel/condomínio
  edificio TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  
  -- Dados do administrador
  admin_nome TEXT,
  admin_email TEXT,
  admin_telefone TEXT,
  
  -- Dados do coletor responsável
  coletor_responsavel TEXT,
  coletor_telefone TEXT,
  
  -- Dados financeiros
  valor_debito DECIMAL(10,2),
  data_vencimento DATE,
  situacao_pagamento TEXT,
  
  -- Dados de controle
  data_ocorrencia DATE,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacoes TEXT,
  
  -- Status de processamento
  processado BOOLEAN DEFAULT false,
  data_processamento TIMESTAMP WITH TIME ZONE,
  erro_processamento TEXT,
  
  -- Relacionamento com tabela de ocorrências (opcional)
  occurrence_id UUID REFERENCES public.occurrences(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.spreadsheet_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view spreadsheet data" 
ON public.spreadsheet_data 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert spreadsheet data" 
ON public.spreadsheet_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update spreadsheet data" 
ON public.spreadsheet_data 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete spreadsheet data" 
ON public.spreadsheet_data 
FOR DELETE 
USING (true);

-- Índices para melhor performance
CREATE INDEX idx_spreadsheet_data_numero_ocorrencia ON public.spreadsheet_data(numero_ocorrencia);
CREATE INDEX idx_spreadsheet_data_edificio ON public.spreadsheet_data(edificio);
CREATE INDEX idx_spreadsheet_data_admin_email ON public.spreadsheet_data(admin_email);
CREATE INDEX idx_spreadsheet_data_processado ON public.spreadsheet_data(processado);
CREATE INDEX idx_spreadsheet_data_data_ocorrencia ON public.spreadsheet_data(data_ocorrencia);

-- Comentários
COMMENT ON TABLE public.spreadsheet_data IS 'Dados importados da planilha de ocorrências';
COMMENT ON COLUMN public.spreadsheet_data.numero_ocorrencia IS 'Número da ocorrência na planilha';
COMMENT ON COLUMN public.spreadsheet_data.processado IS 'Indica se os dados foram processados e importados para a tabela occurrences';
COMMENT ON COLUMN public.spreadsheet_data.occurrence_id IS 'ID da ocorrência criada a partir destes dados';

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_spreadsheet_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_spreadsheet_data_updated_at
  BEFORE UPDATE ON public.spreadsheet_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spreadsheet_data_updated_at();
    `;

    console.log('📝 Aplicando migração SQL...');
    console.log('   ⚠️ Esta migração deve ser aplicada manualmente no Supabase Dashboard');
    console.log('   📋 Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg');
    console.log('   🔧 Vá em SQL Editor e execute o SQL abaixo:\n');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\n   ✅ Após aplicar, execute: node test_spreadsheet_system.js');

    // Tentar verificar se a tabela já existe
    console.log('\n🔍 Verificando se a tabela já existe...');
    const checkResponse = await fetch('https://jamzaegwhzmtvierjckg.supabase.co/rest/v1/spreadsheet_data?select=id&limit=1', {
      headers
    });

    if (checkResponse.ok) {
      console.log('   ✅ Tabela spreadsheet_data já existe!');
      console.log('   🎯 Execute: node test_spreadsheet_system.js');
    } else if (checkResponse.status === 404) {
      console.log('   ❌ Tabela spreadsheet_data não existe');
      console.log('   📝 Aplique a migração SQL acima no Supabase Dashboard');
    } else {
      console.log('   ❌ Erro ao verificar tabela:', checkResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createSpreadsheetTable();

