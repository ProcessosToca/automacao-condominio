# 📧 Configurar Template de Email no Supabase Dashboard

## 🎯 Objetivo
Configurar o template de email "Reset Password" no Supabase para incluir a nova senha gerada automaticamente.

## 📋 Passos para Configuração

### 1. Acessar o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
2. Faça login na sua conta

### 2. Navegar para Configuração de Emails
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Em **"CONFIGURATION"**, clique em **"Emails"**
3. Clique na aba **"Templates"**

### 3. Selecionar Template "Reset Password"
1. Na linha de botões de templates, clique em **"Reset Password"**
2. Você verá o editor HTML do template atual

### 4. Substituir o Template HTML
1. Clique na aba **"<> Source"** (se não estiver selecionada)
2. **Apague todo o conteúdo atual**
3. **Cole o novo template HTML** (veja abaixo)

### 5. Salvar as Alterações
1. Clique em **"Save"** no canto superior direito
2. Aguarde a confirmação de salvamento

## 🔧 Template HTML Atualizado

Cole este código no template "Reset Password":

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Senha - Sistema de Gestão</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .greeting {
            color: #333;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .description {
            color: #555;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .password-section {
            background: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .password-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .password-display {
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            color: #333;
            letter-spacing: 3px;
            border: 1px solid #e0e0e0;
            margin: 10px 0;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .warning p {
            margin: 0;
            color: #856404;
            font-size: 14px;
            line-height: 1.5;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #999;
            font-size: 12px;
            line-height: 1.5;
        }
        .footer p {
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content {
                padding: 25px 20px;
            }
            .password-display {
                font-size: 16px;
                letter-spacing: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Nova Senha Gerada</h1>
            <p>Sistema de Gestão</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                <strong>Olá!</strong>
            </div>
            
            <div class="description">
                Uma nova senha foi gerada para sua conta no sistema. Use esta senha para fazer login imediatamente.
            </div>
            
            <div class="password-section">
                <div class="password-label">Sua nova senha:</div>
                <div class="password-display">{{.NewPassword}}</div>
            </div>
            
            <div class="warning">
                <p>
                    <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere esta senha após fazer login no sistema.
                </p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{.ConfirmationURL}}" class="cta-button">
                    Acessar Sistema
                </a>
            </div>
            
            <div class="description" style="margin-top: 30px;">
                Se você não solicitou esta alteração, entre em contato conosco imediatamente para garantir a segurança da sua conta.
            </div>
        </div>
        
        <div class="footer">
            <p>Este é um email automático, não responda a esta mensagem.</p>
            <p>© 2024 Sistema de Gestão. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

## 📝 Configurar Assunto do Email

1. No campo **"Subject heading"**, digite:
```
🔐 Nova Senha Gerada - Sistema de Gestão
```

## 🔄 Atualizar Função RPC

Para que a nova senha seja incluída no email, execute este SQL no **SQL Editor**:

```sql
-- Atualizar função para incluir nova senha no email
CREATE OR REPLACE FUNCTION public.generate_and_update_password(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
  new_password text;
BEGIN
  -- Verificar se o usuário existe
  SELECT * INTO user_record
  FROM profiles 
  WHERE email = p_email AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado ou inativo');
  END IF;

  -- Gerar nova senha
  new_password := public.generate_random_password(10);
  
  -- Atualizar senha no banco
  UPDATE profiles 
  SET 
    password = new_password,
    updated_at = now()
  WHERE email = p_email;
  
  -- Configurar variável para o template de email
  PERFORM set_config('app.new_password', new_password, false);
  
  -- Retornar sucesso com a nova senha
  RETURN json_build_object(
    'success', true,
    'new_password', new_password,
    'message', 'Nova senha gerada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
```

## 🧪 Testar a Funcionalidade

1. Acesse a aplicação
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Clique em "Gerar Nova Senha"
5. A nova senha será exibida no toast
6. Use a nova senha para fazer login

## 🎯 Como Funciona Agora

1. **Usuário clica em "Esqueci minha senha"**
2. **Sistema gera nova senha automaticamente** (10 caracteres seguros)
3. **Senha é atualizada no banco de dados**
4. **Nova senha é exibida no toast** (sem envio de email)
5. **Usuário pode fazer login imediatamente** com a nova senha

## 🚨 Troubleshooting

### Nova senha não está sendo gerada
1. Verifique se a função RPC foi atualizada
2. Confirme se a tabela `profiles` existe
3. Verifique os logs do console

### Erro na função RPC
1. Execute o SQL novamente
2. Verifique se não há erros de sintaxe
3. Confirme se a tabela `profiles` existe

## 📧 URLs Importantes

- Supabase Dashboard: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg
- SQL Editor: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg/sql
- Authentication > Emails: https://supabase.com/dashboard/project/jamzaegwhzmtvierjckg/auth/templates

## 🎯 Resultado Final

Após a configuração:
- ✅ Nova senha gerada automaticamente
- ✅ Senha exibida no toast de forma clara
- ✅ Usuário pode fazer login imediatamente
- ✅ Sistema funcionando sem dependências externas
- ✅ Template de email configurado (opcional)

