-- Function to request an additional role (only coach<->admin allowed)
CREATE OR REPLACE FUNCTION public.request_additional_role(
  _requested_role user_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _has_role boolean;
  _pending_request boolean;
  _current_roles user_role[];
  _is_student_only boolean;
BEGIN
  _user_id := auth.uid();
  
  -- Get all current roles for the user
  SELECT array_agg(role) INTO _current_roles
  FROM user_roles
  WHERE user_id = _user_id;
  
  -- Check if user is student-only (no coach or admin roles)
  _is_student_only := NOT ('admin' = ANY(_current_roles) OR 'coach' = ANY(_current_roles));
  
  -- Students cannot request additional roles
  IF _is_student_only THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Students cannot request additional roles'
    );
  END IF;
  
  -- Only allow coach<->admin role requests
  IF _requested_role = 'student' THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Cannot request student role'
    );
  END IF;
  
  -- Check if user already has this role
  SELECT EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _requested_role
  ) INTO _has_role;
  
  IF _has_role THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'You already have this role'
    );
  END IF;
  
  -- Check if there's already a pending request
  SELECT EXISTS(
    SELECT 1 FROM pending_role_requests 
    WHERE user_id = _user_id 
    AND requested_role = _requested_role 
    AND status = 'pending'
  ) INTO _pending_request;
  
  IF _pending_request THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'You already have a pending request for this role'
    );
  END IF;
  
  -- Create the request
  INSERT INTO pending_role_requests (user_id, requested_role, status)
  VALUES (_user_id, _requested_role, 'pending');
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Role request submitted successfully. An administrator will review your request.'
  );
END;
$$;