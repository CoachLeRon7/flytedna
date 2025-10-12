-- Drop the existing view
DROP VIEW IF EXISTS public.profiles_secure;

-- Recreate the view with SECURITY INVOKER
-- This ensures RLS policies on profiles table are respected
CREATE VIEW public.profiles_secure 
WITH (security_invoker=on) AS
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