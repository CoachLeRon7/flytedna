-- Create organization_invitations table
CREATE TABLE public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('org_admin', 'coach', 'student')),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

-- Create organization_join_requests table
CREATE TABLE public.organization_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('org_admin', 'coach', 'student')),
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  UNIQUE(user_id, organization_id, status)
);

-- Enable RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_invitations
CREATE POLICY "Org admins can view invitations in their organizations"
  ON public.organization_invitations FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Org admins can create invitations"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (is_org_admin(auth.uid(), organization_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Org admins can update invitations in their organizations"
  ON public.organization_invitations FOR UPDATE
  USING (is_org_admin(auth.uid(), organization_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own email invitations"
  ON public.organization_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS Policies for organization_join_requests
CREATE POLICY "Org admins can view join requests for their organizations"
  ON public.organization_join_requests FOR SELECT
  USING (is_org_admin(auth.uid(), organization_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own join requests"
  ON public.organization_join_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create join requests"
  ON public.organization_join_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Org admins can update join requests in their organizations"
  ON public.organization_join_requests FOR UPDATE
  USING (is_org_admin(auth.uid(), organization_id) OR is_super_admin(auth.uid()));

-- Function to check for pending invitation and auto-approve
CREATE OR REPLACE FUNCTION public.check_and_process_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Look for a pending invitation matching the user's email
  SELECT * INTO invitation_record
  FROM public.organization_invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    -- Mark invitation as accepted
    UPDATE public.organization_invitations
    SET status = 'accepted'
    WHERE id = invitation_record.id;
    
    -- Add user to organization
    INSERT INTO public.organization_members (user_id, organization_id, role, status, approved_at)
    VALUES (NEW.id, invitation_record.organization_id, invitation_record.role, 'approved', now());
    
    -- If a team was specified and role is student or coach, assign to team
    IF invitation_record.team_id IS NOT NULL THEN
      UPDATE public.profiles
      SET team_id = invitation_record.team_id
      WHERE id = NEW.id;
    END IF;
    
    -- Grant appropriate user_role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 
      CASE invitation_record.role
        WHEN 'org_admin' THEN 'admin'::user_role
        WHEN 'coach' THEN 'coach'::user_role
        ELSE 'student'::user_role
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-process invitations on profile creation
CREATE TRIGGER on_profile_check_invitation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_process_invitation();

-- Function to process join requests
CREATE OR REPLACE FUNCTION public.process_join_request(
  request_id uuid,
  approve boolean,
  assign_team_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if caller is org admin
  SELECT * INTO request_record
  FROM public.organization_join_requests
  WHERE id = request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request not found');
  END IF;
  
  IF NOT (is_org_admin(auth.uid(), request_record.organization_id) OR is_super_admin(auth.uid())) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Permission denied');
  END IF;
  
  IF request_record.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Request already processed');
  END IF;
  
  IF approve THEN
    -- Update request status
    UPDATE public.organization_join_requests
    SET status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now()
    WHERE id = request_id;
    
    -- Add user to organization
    INSERT INTO public.organization_members (user_id, organization_id, role, status, approved_by, approved_at)
    VALUES (request_record.user_id, request_record.organization_id, request_record.requested_role, 'approved', auth.uid(), now())
    ON CONFLICT (user_id, organization_id) DO UPDATE
    SET role = request_record.requested_role,
        status = 'approved',
        approved_by = auth.uid(),
        approved_at = now();
    
    -- Assign to team if specified
    IF assign_team_id IS NOT NULL THEN
      UPDATE public.profiles
      SET team_id = assign_team_id
      WHERE id = request_record.user_id;
    END IF;
    
    -- Grant appropriate user_role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (request_record.user_id,
      CASE request_record.requested_role
        WHEN 'org_admin' THEN 'admin'::user_role
        WHEN 'coach' THEN 'coach'::user_role
        ELSE 'student'::user_role
      END
    )
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN jsonb_build_object('success', true, 'message', 'Request approved successfully');
  ELSE
    -- Reject the request
    UPDATE public.organization_join_requests
    SET status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now()
    WHERE id = request_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Request rejected');
  END IF;
END;
$$;