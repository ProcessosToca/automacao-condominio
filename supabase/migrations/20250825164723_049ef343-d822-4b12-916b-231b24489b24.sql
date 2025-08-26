-- Modify profiles table to store password directly and remove verification requirements
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text;

-- Create or replace function to handle new user signup without email verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  insert into public.profiles (user_id, full_name, phone, role, email, password)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'full_name', 
    new.raw_user_meta_data ->> 'phone', 
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'user'::user_role),
    new.email,
    new.encrypted_password
  );
  return new;
END;
$$;

-- Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function for direct signup without email confirmation
CREATE OR REPLACE FUNCTION public.signup_user(
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
  user_data json;
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE email = p_email) THEN
    RETURN json_build_object('error', 'Usuário já existe com este email');
  END IF;

  -- Generate UUID for new user
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles table directly
  INSERT INTO profiles (id, user_id, email, password, full_name, phone, role)
  VALUES (gen_random_uuid(), new_user_id, p_email, p_password, p_full_name, p_phone, p_role);
  
  -- Return success
  RETURN json_build_object(
    'success', true, 
    'user_id', new_user_id,
    'message', 'Usuário criado com sucesso'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;