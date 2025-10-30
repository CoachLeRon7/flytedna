-- Add activity tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create user activity log table
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON public.user_activity_log(activity_type);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_log FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.user_activity_log FOR SELECT
USING (auth.uid() = user_id);

-- System can insert activity logs
CREATE POLICY "System can create activity logs"
ON public.user_activity_log FOR INSERT
WITH CHECK (true);

-- Create materialized view for user activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_activity_summary AS
SELECT 
  p.id as user_id,
  p.first_name,
  p.last_name,
  p.email,
  p.sport,
  p.team_id,
  t.name as team_name,
  ur.role,
  p.is_active,
  p.last_login_at,
  p.login_count,
  p.created_at as account_created_at,
  
  -- Assessment stats
  COUNT(DISTINCT a.id) as total_assessments,
  MAX(a.created_at) as last_assessment_date,
  
  -- Peer assessment stats (as assessor)
  COUNT(DISTINCT pa_given.id) as peer_assessments_given,
  MAX(pa_given.created_at) as last_peer_assessment_given,
  
  -- Peer assessments received
  COUNT(DISTINCT pa_received.id) as peer_assessments_received,
  
  -- Coach assessment stats (for coaches)
  COUNT(DISTINCT ca.id) as coach_assessments_given,
  MAX(ca.created_at) as last_coach_assessment_date,
  
  -- Growth plan status
  COUNT(DISTINCT gp.id) as growth_plans_count,
  MAX(gp.updated_at) as last_growth_plan_update

FROM public.profiles p
LEFT JOIN public.teams t ON p.team_id = t.id
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.assessments a ON p.id = a.user_id
LEFT JOIN public.peer_assessments pa_given ON p.id = pa_given.assessor_id
LEFT JOIN public.peer_assessments pa_received ON p.id = pa_received.assessed_user_id
LEFT JOIN public.coach_assessments ca ON p.id = ca.coach_id
LEFT JOIN public.growth_plans gp ON p.id = gp.user_id

GROUP BY p.id, p.first_name, p.last_name, p.email, p.sport, p.team_id, t.name, ur.role, p.is_active, p.last_login_at, p.login_count, p.created_at
ORDER BY p.created_at DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_summary_user_id ON public.user_activity_summary(user_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_user_activity_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_activity_summary;
END;
$$;

-- Grant access to authenticated users
GRANT SELECT ON public.user_activity_summary TO authenticated;