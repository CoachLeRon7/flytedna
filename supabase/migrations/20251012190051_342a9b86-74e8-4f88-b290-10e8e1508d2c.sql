-- Drop the existing view
DROP VIEW IF EXISTS public.profiles_secure;

-- Recreate the view with security_invoker = true
-- This ensures RLS policies from the underlying profiles table are enforced
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
  team_id,
  role
FROM public.profiles;