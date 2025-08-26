const https = require('https');

// Configurações do Supabase
const SUPABASE_URL = 'jamzaegwhzmtvierjckg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbXphZWd3aHptdHZpZXJqY2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTgzMjgsImV4cCI6MjA3MTI5NDMyOH0.2fcFOmbAb7Xx9trnSmYCzKHIuyEjd8GF8O1lgldM6mM';

// SQL para executar
const sql = `
-- Adicionar coluna CPF
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Criar função update_user_profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id text,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_cpf text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_user record;
BEGIN
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  IF p_email != existing_user.email AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = p_email AND user_id::text != p_user_id
  ) THEN
    RETURN json_build_object('error', 'Este email já está sendo usado por outro usuário');
  END IF;

  UPDATE profiles 
  SET 
    full_name = p_full_name,
    email = p_email,
    phone = p_phone,
    cpf = p_cpf,
    updated_at = now()
  WHERE user_id::text = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'user', json_build_object(
      'id', existing_user.user_id,
      'email', p_email,
      'full_name', p_full_name,
      'phone', p_phone,
      'cpf', p_cpf,
      'role', existing_user.role
    ),
    'message', 'Perfil atualizado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Criar função update_user_password_by_id
CREATE OR REPLACE FUNCTION public.update_user_password_by_id(
  p_user_id text,
  p_new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_user record;
BEGIN
  SELECT * INTO existing_user
  FROM profiles 
  WHERE user_id::text = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Usuário não encontrado');
  END IF;

  UPDATE profiles 
  SET 
    password = p_new_password,
    updated_at = now()
  WHERE user_id::text = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Senha atualizada com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;
`;

// Função para executar SQL
function executeSQL() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    console.log('🚀 Enviando requisição para o Supabase...');
    console.log(`📡 URL: ${SUPABASE_URL}`);
    console.log(`🔑 Usando chave: ${SUPABASE_KEY.substring(0, 20)}...`);

    const req = https.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📄 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Erro: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Executar
async function main() {
  try {
    console.log('🎯 Iniciando aplicação da migração...');
    const result = await executeSQL();
    
    if (result.status === 200) {
      console.log('✅ Migração aplicada com sucesso!');
      console.log('🔄 Recarregue a página da aplicação.');
    } else {
      console.log(`⚠️ Status inesperado: ${result.status}`);
      console.log(`📄 Resposta: ${result.data}`);
    }
  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
  }
}

main();
