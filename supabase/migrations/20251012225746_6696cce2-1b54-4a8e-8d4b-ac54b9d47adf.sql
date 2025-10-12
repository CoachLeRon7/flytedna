-- Step 1: Drop the policy that depends on profiles.role
DROP POLICY IF EXISTS "Coaches and admins can manage teams" ON public.teams;

-- Step 2: Recreate the policy using has_role() function instead
CREATE POLICY "Coaches and admins can manage teams"
  ON public.teams FOR ALL
  USING (
    public.has_role(auth.uid(), 'coach'::user_role) 
    OR public.has_role(auth.uid(), 'admin'::user_role)
  );

-- Step 3: Drop and recreate profiles_secure view without role column
DROP VIEW IF EXISTS public.profiles_secure;

CREATE VIEW public.profiles_secure
WITH (security_invoker = true)
AS
SELECT 
  id,
  mask_email(id, email, team_id) AS email,
  first_name,
  last_name,
  sport,
  updated_at,
  created_at,
  team_id
FROM public.profiles;

-- Step 4: Now drop the deprecated role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;