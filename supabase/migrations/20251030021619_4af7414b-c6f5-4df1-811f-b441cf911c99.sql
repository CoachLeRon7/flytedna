-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.user_activity_summary OWNER TO postgres;

-- Create RLS policies for the materialized view using a security definer function
CREATE OR REPLACE FUNCTION public.user_activity_summary_rls()
RETURNS SETOF public.user_activity_summary
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.user_activity_summary
  WHERE 
    -- Admins can see all users
    has_role(auth.uid(), 'admin')
    -- Users can see their own summary
    OR user_id = auth.uid()
    -- Coaches can see their team members
    OR (
      has_role(auth.uid(), 'coach')
      AND team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), team_id)
    );
$$;

-- Revoke direct access to the materialized view
REVOKE SELECT ON public.user_activity_summary FROM authenticated;

-- Grant access through the security definer function
GRANT EXECUTE ON FUNCTION public.user_activity_summary_rls() TO authenticated;