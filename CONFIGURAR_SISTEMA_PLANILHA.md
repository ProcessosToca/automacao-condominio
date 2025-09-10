# 🚀 Configuração do Sistema de Planilha

## 📋 Resumo
Sistema completo para importar dados da planilha de ocorrências para o banco de dados, com interface de gerenciamento e processamento automático.

## 🎯 O que foi criado

### 1. **Tabela de Dados da Planilha**
- Tabela `spreadsheet_data` com todos os campos da planilha
- Campos para controle de processamento
- Relacionamento com tabela `occurrences`

### 2. **Edge Function de Importação**
- Função `import-spreadsheet` para importar dados automaticamente
- Parse inteligente do CSV da planilha
- Mapeamento automático de campos

### 3. **Interface de Gerenciamento**
- Componente `SpreadsheetManager` para gerenciar importações
- Página `/spreadsheet-management` para administradores
- Estatísticas e controles visuais

### 4. **Scripts de Suporte**
- Scripts para aplicar migrações
- Scripts para testar o sistema
- Scripts para importação manual

## 🔧 Passos para Configurar

### Passo 1: Aplicar Migração SQL
1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Vá em **SQL Editor**
3. Cole e execute o SQL abaixo:

```sql
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
```

### Passo 2: Testar o Sistema
Execute o comando:
```bash
node setup_spreadsheet_system.js
```

### Passo 3: Acessar Interface
1. Acesse: http://localhost:8080/spreadsheet-management
2. Clique em **"Importar da Planilha"**
3. Verifique os dados importados

## 📊 Funcionalidades

### ✅ Importação Automática
- Conecta diretamente com a planilha do Google Sheets
- Parse inteligente do CSV
- Mapeamento automático de campos
- Tratamento de erros

### ✅ Interface de Gerenciamento
- Estatísticas em tempo real
- Controles de importação
- Visualização de dados
- Processamento para ocorrências

### ✅ Controle de Qualidade
- Validação de dados
- Log de erros
- Status de processamento
- Limpeza de dados

## 🔄 Fluxo de Trabalho

1. **Importação**: Dados da planilha → Tabela `spreadsheet_data`
2. **Validação**: Verificação e limpeza dos dados
3. **Processamento**: Conversão para ocorrências na tabela `occurrences`
4. **Controle**: Acompanhamento de status e erros

## 🎯 Próximos Passos

1. **Aplicar a migração SQL** no Supabase Dashboard
2. **Testar a importação** com o script
3. **Acessar a interface** de gerenciamento
4. **Importar os dados** da planilha
5. **Verificar os resultados** na interface

## 📱 Acesso Rápido

- **Interface**: http://localhost:8080/spreadsheet-management
- **Dashboard**: http://localhost:8080/dashboard
- **Supabase**: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg

## ⚠️ Importante

- A planilha do Google Sheets deve estar **pública**
- Apenas usuários **admin** podem acessar a interface
- Os dados são importados em **tempo real** da planilha
- Backup automático antes de limpar dados existentes

---

**🎉 Sistema pronto para uso! Aplique a migração e teste a importação.**

