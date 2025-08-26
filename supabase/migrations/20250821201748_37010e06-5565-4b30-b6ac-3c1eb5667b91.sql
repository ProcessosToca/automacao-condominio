-- First, let's insert profiles for existing users who don't have profiles
INSERT INTO public.profiles (user_id, full_name, phone, role, is_active)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', ''),
  COALESCE(au.raw_user_meta_data ->> 'phone', ''),
  COALESCE((au.raw_user_meta_data ->> 'role')::user_role, 'user'),
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
);

-- Create verification codes table
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_confirmation', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification codes
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Users can view their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR email = auth.email());

CREATE POLICY "Users can insert their own verification codes" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text OR email = auth.email());

CREATE POLICY "Users can update their own verification codes" 
ON public.verification_codes 
FOR UPDATE 
USING (auth.uid()::text = user_id::text OR email = auth.email());

-- Create index for better performance
CREATE INDEX idx_verification_codes_user_email ON public.verification_codes(user_id, email);
CREATE INDEX idx_verification_codes_code_type ON public.verification_codes(code, type);

-- Function to generate verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to create verification code
CREATE OR REPLACE FUNCTION public.create_verification_code(
  p_user_id UUID,
  p_email TEXT,
  p_type TEXT
) RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Generate 6-digit code
  v_code := public.generate_verification_code();
  
  -- Invalidate any existing codes for this user and type
  UPDATE public.verification_codes 
  SET used = true 
  WHERE user_id = p_user_id 
    AND type = p_type 
    AND used = false;
  
  -- Insert new verification code
  INSERT INTO public.verification_codes (user_id, email, code, type, expires_at)
  VALUES (
    p_user_id,
    p_email,
    v_code,
    p_type,
    now() + interval '10 minutes'
  );
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify code
CREATE OR REPLACE FUNCTION public.verify_code(
  p_email TEXT,
  p_code TEXT,
  p_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN := false;
BEGIN
  -- Check if code is valid and not expired
  SELECT true INTO v_valid
  FROM public.verification_codes
  WHERE email = p_email
    AND code = p_code
    AND type = p_type
    AND used = false
    AND expires_at > now();
  
  -- Mark code as used if valid
  IF v_valid THEN
    UPDATE public.verification_codes
    SET used = true
    WHERE email = p_email
      AND code = p_code
      AND type = p_type
      AND used = false;
  END IF;
  
  RETURN COALESCE(v_valid, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;