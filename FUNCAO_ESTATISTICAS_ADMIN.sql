-- Função para buscar estatísticas do administrador
-- Execute este script no Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
  END IF;

  -- Retornar estatísticas
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
          FROM (
            SELECT 1 
            FROM profiles 
            WHERE is_active = true
          ) AS dummy_reports
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
