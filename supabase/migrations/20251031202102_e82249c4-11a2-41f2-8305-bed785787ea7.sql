-- Update handle_new_user function to auto-approve first admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role user_role;
  admin_count INTEGER;
  is_first_admin BOOLEAN := FALSE;
BEGIN
  -- Extract requested role from metadata, default to 'student'
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role;
  
  -- Insert profile WITHOUT role assignment
  INSERT INTO public.profiles (id, email, first_name, last_name, sport)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'sport'
  );
  
  -- Check if this is the first admin request when no admins exist
  IF requested_role = 'admin' THEN
    SELECT COUNT(*) INTO admin_count
    FROM public.user_roles
    WHERE role = 'admin';
    
    is_first_admin := (admin_count = 0);
  END IF;
  
  -- Handle role assignment
  IF is_first_admin THEN
    -- AUTO-APPROVE: First admin gets immediate access
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    -- Log this special case
    INSERT INTO public.user_activity_log (user_id, activity_type, activity_details)
    VALUES (NEW.id, 'first_admin_auto_approved', jsonb_build_object(
      'timestamp', NOW(),
      'reason', 'First administrator in system - auto-approved'
    ));
    
    -- Create a record in pending_role_requests with auto-approved status
    INSERT INTO public.pending_role_requests (user_id, requested_role, status, reason, reviewed_at)
    VALUES (NEW.id, 'admin', 'approved', 'Auto-approved: First system administrator', NOW());
    
  ELSIF requested_role IN ('coach', 'admin') THEN
    -- MANUAL APPROVAL REQUIRED: Create pending request
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
    
    INSERT INTO public.pending_role_requests (user_id, requested_role, status)
    VALUES (NEW.id, requested_role, 'pending');
    
  ELSE
    -- STUDENT: Direct assignment, no approval needed
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$$;