-- Remove foreign key constraint that links to auth.users table
-- since we're now using direct database storage instead of Supabase auth

-- First, let's drop the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Make sure user_id column allows any UUID (not just ones from auth.users)
-- This is already the case, but let's be explicit about it

-- Update the create_direct_user function to use better UUID generation
CREATE OR REPLACE FUNCTION public.create_direct_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text DEFAULT '',
  p_role user_role DEFAULT 'user'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  profile_uuid uuid;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Usuário já existe com este email');
  END IF;

  -- Generate UUIDs for new user and profile
  user_uuid := gen_random_uuid();
  profile_uuid := gen_random_uuid();
  
  -- Insert into profiles table directly (no auth.users dependency)
  INSERT INTO profiles (id, user_id, email, password, full_name, phone, role)
  VALUES (profile_uuid, user_uuid, p_email, p_password, p_full_name, p_phone, p_role);
  
  -- Return success with user data
  RETURN json_build_object(
    'success', true, 
    'user', json_build_object(
      'id', user_uuid,
      'email', p_email,
      'full_name', p_full_name,
      'phone', p_phone,
      'role', p_role
    ),
    'message', 'Usuário criado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;