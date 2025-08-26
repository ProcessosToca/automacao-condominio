# 📧 Configurar Resend + Express para Envio de Emails

## 🎯 Objetivo
Configurar um servidor Express com Resend para enviar emails reais com a nova senha gerada.

## 🚀 Passo a Passo

### Passo 1: Criar Conta no Resend
1. Acesse: https://resend.com/
2. Clique em "Sign Up Free"
3. Crie uma conta gratuita (100 emails/dia)
4. Verifique seu email

### Passo 2: Obter API Key
1. No painel do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. **Nome**: `inteliscribe-email`
4. **Copie a API Key** (ex: `re_53A6x9k9_EYwAwKBhAeTX9FUQHz7HgaMx`)

### Passo 3: Verificar Domínio (Opcional)
Para emails mais confiáveis:
1. Vá em **Domains**
2. Clique em **Add Domain**
3. Siga as instruções para verificar seu domínio
4. Configure SPF/DKIM

### Passo 4: Configurar Variáveis de Ambiente
1. Crie o arquivo `server/.env`:
```bash
# Configurações do Resend
RESEND_API_KEY=re_53A6x9k9_EYwAwKBhAeTX9FUQHz7HgaMx

# Configurações do servidor
PORT=3001

# Configurações de email
FROM_EMAIL=noreply@inteliscribe.com
REPLY_TO_EMAIL=contato@inteliscribe.com
```

### Passo 5: Iniciar o Servidor de Email
```bash
# No terminal, na pasta raiz do projeto:
node server/email-server.js
```

Você deve ver:
```
🚀 Servidor de email rodando em http://localhost:3001
📧 Endpoint: http://localhost:3001/send-password-reset
🏥 Health check: http://localhost:3001/health
```

### Passo 6: Testar o Servidor
1. Abra: http://localhost:3001/health
2. Deve retornar: `{"status":"OK","message":"Servidor de email funcionando"}`

### Passo 7: Testar a Funcionalidade
1. **Mantenha o servidor rodando** (terminal 1)
2. **Inicie a aplicação** (terminal 2): `npm run dev`
3. **Acesse**: http://localhost:8080
4. **Clique em "Esqueci minha senha"**
5. **Digite um email válido**
6. **Clique em "Gerar Nova Senha"**

## 🧪 Testes

### Teste 1: Health Check
```bash
curl http://localhost:3001/health
```

### Teste 2: Envio de Email
```bash
curl -X POST http://localhost:3001/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "newPassword": "teste123",
    "userName": "Teste"
  }'
```

## 🎯 Resultado Esperado

Após configuração:
- ✅ Servidor Express rodando na porta 3001
- ✅ Resend configurado e funcionando
- ✅ Emails enviados automaticamente
- ✅ Template profissional
- ✅ Nova senha no email
- ✅ Link para acessar sistema

## 🔧 Troubleshooting

### Servidor não inicia
- Verifique se a porta 3001 está livre
- Confirme se o arquivo .env existe
- Verifique se a API Key está correta

### Email não chega
- Verifique a pasta de spam
- Confirme se o domínio está verificado
- Verifique os logs do servidor

### Erro de CORS
- O servidor já está configurado para aceitar localhost:8080
- Se necessário, ajuste a configuração CORS

## 📁 Estrutura de Arquivos

```
projeto/
├── server/
│   ├── email-server.js    # Servidor Express
│   ├── .env              # Variáveis de ambiente
│   └── env.example       # Exemplo de configuração
├── src/
│   ├── services/
│   │   └── emailService.ts # Cliente de email
│   └── ...
└── ...
```

## 🚀 Scripts Úteis

### Iniciar servidor de email
```bash
node server/email-server.js
```

### Verificar se está rodando
```bash
curl http://localhost:3001/health
```

### Testar envio de email
```bash
curl -X POST http://localhost:3001/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","newPassword":"123456"}'
```

## 💡 Dicas

1. **Mantenha o servidor rodando** enquanto testa
2. **Use domínio verificado** para melhor entregabilidade
3. **Monitore os logs** para identificar problemas
4. **Teste com seu próprio email** primeiro

## 🔒 Segurança

- API Key do Resend tem permissões limitadas
- Emails são enviados apenas para reset de senha
- Servidor local para desenvolvimento
- CORS configurado para localhost

---

**Pronto!** Agora o sistema enviará emails reais com a nova senha! 🎉
