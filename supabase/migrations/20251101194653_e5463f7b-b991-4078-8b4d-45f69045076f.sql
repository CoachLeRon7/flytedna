-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution TEXT,
  email_domain TEXT, -- For auto-matching (e.g., 'wiu.edu')
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add organization_id to teams
ALTER TABLE public.teams 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Create organization_members junction table (users can belong to multiple orgs)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'coach', 'student')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id, role)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND role = 'super_admin'
      AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role IN ('super_admin', 'org_admin')
      AND status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
    AND status = 'approved'
$$;

-- RLS Policies for organizations
CREATE POLICY "Super admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update all organizations"
ON public.organizations FOR UPDATE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins can view their organizations"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role IN ('org_admin', 'coach', 'student')
      AND status = 'approved'
  )
);

-- RLS Policies for organization_members
CREATE POLICY "Super admins can view all members"
ON public.organization_members FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins can view members in their organizations"
ON public.organization_members FOR SELECT
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users can view their own memberships"
ON public.organization_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all memberships"
ON public.organization_members FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Org admins can approve members in their organizations"
ON public.organization_members FOR UPDATE
USING (is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Users can request to join organizations"
ON public.organization_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update teams RLS to respect organizations
DROP POLICY IF EXISTS "Authenticated users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches and admins can manage teams" ON public.teams;

CREATE POLICY "Users can view teams in their organizations"
ON public.teams FOR SELECT
USING (
  organization_id IN (SELECT get_user_organizations(auth.uid()))
  OR is_super_admin(auth.uid())
);

CREATE POLICY "Org admins can manage teams in their organizations"
ON public.teams FOR ALL
USING (
  is_org_admin(auth.uid(), organization_id)
  OR is_super_admin(auth.uid())
);

-- Update profiles RLS to respect organizations
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Org admins can view profiles in their organizations"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id
  OR are_teammates(auth.uid(), id)
  OR (has_role(auth.uid(), 'coach') AND team_id IS NOT NULL AND is_coach_for_team(auth.uid(), team_id))
  OR is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = profiles.team_id
      AND om.user_id = auth.uid()
      AND om.role IN ('org_admin', 'super_admin')
      AND om.status = 'approved'
  )
);

CREATE POLICY "Org admins can update profiles in their organizations"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id
  OR (has_role(auth.uid(), 'coach') AND team_id IS NOT NULL AND is_coach_for_team(auth.uid(), team_id))
  OR is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = profiles.team_id
      AND om.user_id = auth.uid()
      AND om.role IN ('org_admin', 'super_admin')
      AND om.status = 'approved'
  )
);

CREATE POLICY "Org admins can delete profiles in their organizations"
ON public.profiles FOR DELETE
USING (
  is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.organization_members om ON t.organization_id = om.organization_id
    WHERE t.id = profiles.team_id
      AND om.user_id = auth.uid()
      AND om.role IN ('org_admin', 'super_admin')
      AND om.status = 'approved'
  )
);

-- Migrate existing data: Create Flyte Academy organization
INSERT INTO public.organizations (name, institution, email_domain)
VALUES ('Flyte Academy', 'Flyte Academy', 'flyteacademy.org');

-- Get the org ID
DO $$
DECLARE
  flyte_org_id UUID;
  admin_user_id UUID;
  wiu_user_id UUID;
BEGIN
  SELECT id INTO flyte_org_id FROM public.organizations WHERE email_domain = 'flyteacademy.org';
  
  -- Find admin@flyteacademy.org
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@flyteacademy.org';
  
  -- Make admin@flyteacademy.org a super admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, status, approved_at)
    VALUES (flyte_org_id, admin_user_id, 'super_admin', 'approved', now())
    ON CONFLICT (organization_id, user_id, role) DO NOTHING;
  END IF;
  
  -- Link all existing teams to Flyte Academy org
  UPDATE public.teams SET organization_id = flyte_org_id WHERE organization_id IS NULL;
END $$;

-- Create WIU organization
INSERT INTO public.organizations (name, institution, email_domain)
VALUES ('Western Illinois University', 'Western Illinois University', 'wiu.edu');

-- Assign la-williams2@wiu.edu as org_admin for WIU
DO $$
DECLARE
  wiu_org_id UUID;
  wiu_user_id UUID;
BEGIN
  SELECT id INTO wiu_org_id FROM public.organizations WHERE email_domain = 'wiu.edu';
  SELECT id INTO wiu_user_id FROM auth.users WHERE email = 'la-williams2@wiu.edu';
  
  IF wiu_user_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, status, approved_at)
    VALUES (wiu_org_id, wiu_user_id, 'org_admin', 'approved', now())
    ON CONFLICT (organization_id, user_id, role) DO NOTHING;
  END IF;
END $$;

-- Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();