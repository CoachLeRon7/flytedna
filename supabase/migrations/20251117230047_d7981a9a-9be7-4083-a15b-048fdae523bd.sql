-- Add referral source tracking to profiles table
ALTER TABLE public.profiles ADD COLUMN referral_source TEXT;

-- Add index for analytics queries
CREATE INDEX idx_profiles_referral_source ON public.profiles(referral_source) 
WHERE referral_source IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.referral_source IS 'Tracks how the user heard about the platform';

-- Update handle_new_user function to include referral_source
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  requested_role user_role;
  admin_count INTEGER;
  is_first_admin BOOLEAN := FALSE;
BEGIN
  requested_role := (NEW.raw_user_meta_data->>'role')::user_role;
  
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    is_first_admin := TRUE;
  END IF;
  
  INSERT INTO public.profiles (id, email, first_name, last_name, sport, date_of_birth, registration_type, referral_source)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'sport',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    COALESCE(NEW.raw_user_meta_data->>'registration_type', 'team'),
    NEW.raw_user_meta_data->>'referral_source'
  );
  
  IF is_first_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSIF requested_role IS NOT NULL THEN
    IF requested_role = 'admin' THEN
      INSERT INTO public.pending_role_requests (user_id, requested_role, status)
      VALUES (NEW.id, requested_role, 'pending');
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, requested_role);
    END IF;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;