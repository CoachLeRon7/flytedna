-- Update get_user_role to return highest priority role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'coach' THEN 2
      WHEN 'student' THEN 3
    END
  LIMIT 1
$$;

-- Create new function to get all roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS user_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT array_agg(role ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'coach' THEN 2
      WHEN 'student' THEN 3
    END
  )
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- Update process_role_request to support multi-role
CREATE OR REPLACE FUNCTION public.process_role_request(request_id uuid, approve boolean, rejection_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can process role requests';
  END IF;
  
  -- Get the request
  SELECT * INTO request_record
  FROM public.pending_role_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role request not found or already processed';
  END IF;
  
  -- Update request status
  IF approve THEN
    UPDATE public.pending_role_requests
    SET status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = NOW()
    WHERE id = request_id;
    
    -- Add the new role if user doesn't already have it
    INSERT INTO public.user_roles (user_id, role)
    VALUES (request_record.user_id, request_record.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Only remove student role if upgrading to coach or admin AND they don't already have those roles
    IF request_record.requested_role IN ('coach', 'admin') THEN
      -- Check if this is their first elevated role
      IF NOT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = request_record.user_id 
        AND role IN ('coach', 'admin')
        AND role != request_record.requested_role
      ) THEN
        DELETE FROM public.user_roles
        WHERE user_id = request_record.user_id AND role = 'student';
      END IF;
    END IF;
  ELSE
    UPDATE public.pending_role_requests
    SET status = 'rejected',
        reason = rejection_reason,
        reviewed_by = auth.uid(),
        reviewed_at = NOW()
    WHERE id = request_id;
  END IF;
END;
$$;