# 📧 Sistema de Envio de Emails em Massa - Guia de Deploy

## 🎯 Objetivo
Implementar sistema completo de envio automático de emails para ocorrências com controle de status e interface administrativa.

## 📋 Componentes Criados

### 1. Migração de Banco de Dados
- **Arquivo**: `supabase/migrations/20250101000003_add_email_status_to_occurrences.sql`
- **Função**: Adiciona colunas de controle de email na tabela `occurrences`

### 2. Edge Function
- **Arquivo**: `supabase/functions/send-bulk-emails/index.ts`
- **Função**: Processa envio de emails em lote com template personalizado

### 3. Script Python
- **Arquivo**: `bulk_email_processor.py`
- **Função**: Interface de linha de comando para controle e monitoramento

### 4. Componente React
- **Arquivo**: `src/components/BulkEmailManager.tsx`
- **Função**: Interface web para gerenciamento de emails

### 5. Página React
- **Arquivo**: `src/pages/BulkEmails.tsx`
- **Função**: Página dedicada ao gerenciamento de emails

## 🚀 Passos para Deploy

### Passo 1: Aplicar Migração
```bash
# Aplicar migração no Supabase
npx supabase db push
```

### Passo 2: Deploy da Edge Function
```bash
# Deploy da função de envio em massa
npx supabase functions deploy send-bulk-emails
```

### Passo 3: Configurar SendGrid (Opcional)
```bash
# Configurar API Key do SendGrid
npx supabase secrets set SENDGRID_API_KEY=sua_api_key_aqui
```

### Passo 4: Testar o Sistema
1. Acesse a aplicação
2. Faça login como administrador
3. Vá para Dashboard → "Emails em Massa"
4. Configure modo teste e limite de emails
5. Clique em "Iniciar Processamento"

## 📊 Funcionalidades

### Controle de Status
- **Não enviado**: Ocorrências que ainda não tiveram email enviado
- **Aguardando Retorno**: Email enviado, aguardando resposta
- **Enviado**: Processo concluído
- **Erro no Envio**: Falha no envio, pode ser reprocessado

### Modo Teste
- Simula envio sem enviar emails reais
- Atualiza status para teste
- Ideal para desenvolvimento e testes

### Modo Produção
- Envia emails reais via SendGrid
- Atualiza status automaticamente
- Logs detalhados de sucesso/erro

### Interface Web
- Estatísticas em tempo real
- Controle de limite de emails
- Botão para resetar erros
- Resultados detalhados do último processamento

### Script Python
- Interface de linha de comando
- Estatísticas detalhadas
- Processamento em lote
- Reset de status com erro

## 📧 Template de Email

O email enviado contém:
- **Assunto**: "Consulta de Débitos - [Nome do Edifício]"
- **Conteúdo**: Template HTML responsivo com:
  - Número da ocorrência
  - Dados do imóvel (edifício, endereço, complemento)
  - Nome do administrador
  - Design profissional

## 🔧 Configurações

### Variáveis de Ambiente
- `SENDGRID_API_KEY`: Chave da API do SendGrid
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

### Limites e Controles
- Limite padrão: 10 emails por execução
- Timeout: 5 minutos por processamento
- Modo teste ativo por padrão

## 🧪 Como Testar

### 1. Teste via Interface Web
1. Acesse `/bulk-emails`
2. Verifique estatísticas
3. Configure modo teste
4. Execute processamento
5. Verifique resultados

### 2. Teste via Script Python
```bash
python bulk_email_processor.py
# Escolha opção 1 para ver estatísticas
# Escolha opção 2 para processar em modo teste
```

### 3. Teste via Edge Function Direta
```bash
curl -X POST https://jamzaegwhzmtvierjckg.supabase.co/functions/v1/send-bulk-emails \
  -H "Authorization: Bearer sua_chave_aqui" \
  -H "Content-Type: application/json" \
  -d '{"limit": 5, "testMode": true}'
```

## 📈 Monitoramento

### Logs da Edge Function
```bash
npx supabase functions logs send-bulk-emails
```

### Estatísticas no Banco
```sql
SELECT 
  email_status,
  COUNT(*) as quantidade
FROM occurrences 
GROUP BY email_status;
```

### Verificar Emails Enviados
```sql
SELECT 
  o.id,
  o.title,
  p.name as edificio,
  p.admin_email,
  o.email_status,
  o.email_sent_at
FROM occurrences o
JOIN properties p ON o.property_id = p.id
WHERE o.email_status != 'Não enviado'
ORDER BY o.email_sent_at DESC;
```

## 🚨 Troubleshooting

### Erro: "Edge Function não encontrada"
- Verifique se o deploy foi feito: `npx supabase functions list`
- Redeploy se necessário: `npx supabase functions deploy send-bulk-emails`

### Erro: "Nenhuma ocorrência encontrada"
- Verifique se existem ocorrências com `email_status = 'Não enviado'`
- Verifique se as propriedades têm `admin_email` preenchido

### Erro: "Timeout"
- Reduza o limite de emails por execução
- Verifique logs da Edge Function para detalhes

### Emails não chegam
- Verifique configuração do SendGrid
- Verifique logs de entrega no SendGrid
- Teste com modo teste primeiro

## ✅ Checklist de Deploy

- [ ] Migração aplicada no banco
- [ ] Edge Function deployada
- [ ] SendGrid configurado (opcional)
- [ ] Interface web acessível
- [ ] Teste em modo teste executado
- [ ] Estatísticas carregando corretamente
- [ ] Processamento funcionando
- [ ] Logs sendo gerados
- [ ] Reset de erros funcionando

## 🎉 Resultado Final

Após implementação completa:
- ✅ Sistema de envio automático funcionando
- ✅ Controle de status implementado
- ✅ Interface administrativa disponível
- ✅ Modo teste para desenvolvimento
- ✅ Logs e monitoramento ativos
- ✅ Template de email profissional
- ✅ Script Python para automação

