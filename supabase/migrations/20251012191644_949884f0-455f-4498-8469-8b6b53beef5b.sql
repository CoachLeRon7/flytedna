-- Create pending role requests table
CREATE TABLE public.pending_role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role user_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, requested_role, status)
);

-- Enable RLS
ALTER TABLE public.pending_role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own role requests"
ON public.pending_role_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all role requests"
ON public.pending_role_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update role requests"
ON public.pending_role_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- System can insert requests via trigger
CREATE POLICY "System can create role requests"
ON public.pending_role_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop and recreate handle_new_user to create role requests
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role user_role;
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
  
  -- Always assign 'student' role initially
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  -- If user requested coach or admin, create a pending role request
  IF requested_role IN ('coach', 'admin') THEN
    INSERT INTO public.pending_role_requests (user_id, requested_role, status)
    VALUES (NEW.id, requested_role, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to approve/reject role requests
CREATE OR REPLACE FUNCTION public.process_role_request(
  request_id UUID,
  approve BOOLEAN,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    
    -- Check if user already has this role
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = request_record.user_id AND role = request_record.requested_role
    ) THEN
      -- Remove student role if upgrading to coach/admin
      IF request_record.requested_role IN ('coach', 'admin') THEN
        DELETE FROM public.user_roles
        WHERE user_id = request_record.user_id AND role = 'student';
      END IF;
      
      -- Assign the new role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (request_record.user_id, request_record.requested_role);
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