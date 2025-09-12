# 🚀 Aplicar Migração da Tabela Planilha

## ❌ Problema
A tabela `spreadsheet_data` não existe no banco de dados, causando erro 404.

## ✅ Solução
Aplique a migração SQL manualmente no Supabase Dashboard.

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
- Faça login na sua conta

### 2. Vá para o SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. Cole e Execute o SQL
Cole o SQL abaixo e clique em **"Run"**:

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

### 4. Verificar se Funcionou
- Você deve ver a mensagem: **"Success. No rows returned"**
- A tabela `spreadsheet_data` foi criada com sucesso

### 5. Testar o Sistema
Após aplicar a migração, execute:
```bash
node test_spreadsheet_system.js
```

### 6. Acessar a Interface
- URL: http://localhost:8080/spreadsheet-management
- Clique em **"Importar da Planilha"**

## 🎯 Resultado Esperado
- ✅ Tabela `spreadsheet_data` criada
- ✅ Políticas RLS configuradas
- ✅ Índices criados para performance
- ✅ Interface funcionando
- ✅ Importação de dados da planilha

## ⚠️ Importante
- Execute o SQL completo de uma vez
- Não execute partes separadas
- Aguarde a conclusão antes de testar

---

**🎉 Após aplicar a migração, o sistema de planilha estará funcionando!**




