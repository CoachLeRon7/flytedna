-- Fix materialized view API exposure by ensuring no direct access
-- Only the security definer function should be accessible

-- Revoke all direct access to the materialized view from all roles
REVOKE ALL ON public.user_activity_summary FROM PUBLIC;
REVOKE ALL ON public.user_activity_summary FROM authenticated;
REVOKE ALL ON public.user_activity_summary FROM anon;

-- Ensure the security definer function has proper access
GRANT EXECUTE ON FUNCTION public.user_activity_summary_rls() TO authenticated;

-- Add a comment to document this is intentionally not directly accessible
COMMENT ON MATERIALIZED VIEW public.user_activity_summary IS 
'This materialized view is not directly accessible via API. Access is controlled through the user_activity_summary_rls() security definer function which enforces proper RLS policies.';