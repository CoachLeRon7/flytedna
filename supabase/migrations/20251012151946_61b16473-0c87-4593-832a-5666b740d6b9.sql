-- Create function to conditionally mask email addresses
CREATE OR REPLACE FUNCTION public.mask_email(
  profile_id uuid,
  profile_email text,
  profile_team_id uuid
)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    -- Show email to the profile owner
    WHEN auth.uid() = profile_id THEN profile_email
    -- Show email to admins
    WHEN public.has_role(auth.uid(), 'admin') THEN profile_email
    -- Show email to coaches of the team
    WHEN profile_team_id IS NOT NULL 
         AND public.has_role(auth.uid(), 'coach')
         AND public.is_coach_for_team(auth.uid(), profile_team_id) THEN profile_email
    -- Mask email for everyone else
    ELSE '***@***.***'
  END
$$;

-- Create secure view with masked emails
CREATE VIEW public.profiles_secure AS
SELECT 
  id,
  public.mask_email(id, email, team_id) as email,
  first_name,
  last_name,
  sport,
  updated_at,
  created_at,
  team_id,
  role
FROM public.profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_secure TO authenticated;