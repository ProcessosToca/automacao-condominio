-- Script para verificar usuários no banco de dados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se existem usuários na tabela profiles
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as usuarios_comuns
FROM profiles 
WHERE is_active = true;

-- 2. Listar todos os usuários
SELECT 
  user_id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
WHERE is_active = true
ORDER BY created_at DESC;

-- 3. Testar a função get_all_users
SELECT public.get_all_users();

-- 4. Verificar se a função is_admin existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';

-- 5. Se a função is_admin não existir, criá-la
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
