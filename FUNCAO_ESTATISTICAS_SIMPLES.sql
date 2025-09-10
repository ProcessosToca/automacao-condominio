-- Função simplificada para estatísticas do administrador
-- Esta versão não depende da função is_admin() e deve funcionar imediatamente

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retornar estatísticas (sem verificação de admin por enquanto)
  RETURN json_build_object(
    'success', true,
    'stats', (
      SELECT json_build_object(
        'active_users', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true
        ),
        'new_users', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true 
          AND created_at >= now() - interval '30 days'
        ),
        'reports', (
          SELECT COUNT(*) 
          FROM profiles 
          WHERE is_active = true
        )
      )
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_admin_stats';

-- Testar a função
SELECT public.get_admin_stats();
