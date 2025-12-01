-- Update handle_new_user function to auto-assign admin role for @flytedna.com emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role user_role;
  admin_count INTEGER;
  is_first_admin BOOLEAN := FALSE;
  is_flytedna_admin BOOLEAN := FALSE;
  flyte_academy_org_id UUID := '533e098b-efb8-4e61-99bb-e0d84f5c2253';
BEGIN
  requested_role := (NEW.raw_user_meta_data->>'role')::user_role;
  
  -- Check if this is a @flytedna.com email
  IF NEW.email ILIKE '%@flytedna.com' THEN
    is_flytedna_admin := TRUE;
  END IF;
  
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
  
  -- Auto-assign admin role for @flytedna.com emails
  IF is_flytedna_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Add to Flyte Academy organization as super_admin
    INSERT INTO public.organization_members (user_id, organization_id, role, status, approved_at, approved_by)
    VALUES (NEW.id, flyte_academy_org_id, 'super_admin', 'approved', now(), NEW.id);
  ELSIF is_first_admin THEN
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
$function$;