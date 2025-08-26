-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.create_verification_code(
  p_user_id UUID,
  p_email TEXT,
  p_type TEXT
) RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.verify_code(
  p_email TEXT,
  p_code TEXT,
  p_type TEXT
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;