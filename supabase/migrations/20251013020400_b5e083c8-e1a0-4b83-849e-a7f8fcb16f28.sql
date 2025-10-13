-- Create peer_assessments table
CREATE TABLE public.peer_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessor_id UUID NOT NULL,
  assessed_user_id UUID NOT NULL,
  timepoint assessment_timepoint NOT NULL,
  semester_label TEXT NOT NULL,
  
  -- 15 peer assessment questions (3 per domain)
  l1 INTEGER,
  l2 INTEGER,
  l3 INTEGER,
  e1 INTEGER,
  e2 INTEGER,
  e3 INTEGER,
  a1 INTEGER,
  a2 INTEGER,
  a3 INTEGER,
  d1 INTEGER,
  d2 INTEGER,
  d3 INTEGER,
  b1 INTEGER,
  b2 INTEGER,
  b3 INTEGER,
  
  -- Computed scores
  leadership_dna_mean NUMERIC,
  excellence_mean NUMERIC,
  accountability_mean NUMERIC,
  discipline_mean NUMERIC,
  belonging_mean NUMERIC,
  composite_mean NUMERIC,
  classification leadership_classification,
  
  -- Optional anonymous comment
  optional_comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate assessments
  UNIQUE(assessor_id, assessed_user_id, timepoint, semester_label)
);

-- Enable RLS
ALTER TABLE public.peer_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Teammates can create peer assessments for each other
CREATE POLICY "Teammates can create peer assessments"
ON public.peer_assessments
FOR INSERT
WITH CHECK (
  auth.uid() = assessor_id
  AND are_teammates(auth.uid(), assessed_user_id)
  AND auth.uid() != assessed_user_id
);

-- Users can view their own submitted assessments
CREATE POLICY "Users can view their own submitted peer assessments"
ON public.peer_assessments
FOR SELECT
USING (auth.uid() = assessor_id);

-- Coaches can view peer assessments for their team
CREATE POLICY "Coaches can view peer assessments for their teams"
ON public.peer_assessments
FOR SELECT
USING (
  has_role(auth.uid(), 'coach') 
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = peer_assessments.assessed_user_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  )
);

-- Admins can view all peer assessments
CREATE POLICY "Admins can view all peer assessments"
ON public.peer_assessments
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for computing scores
CREATE TRIGGER compute_peer_assessment_scores
BEFORE INSERT OR UPDATE ON public.peer_assessments
FOR EACH ROW
EXECUTE FUNCTION public.compute_coach_assessment_scores();

-- Create trigger for updated_at
CREATE TRIGGER update_peer_assessments_updated_at
BEFORE UPDATE ON public.peer_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create view for aggregated peer feedback (only shows if 3+ responses)
CREATE OR REPLACE VIEW public.peer_feedback_aggregated AS
SELECT 
  assessed_user_id,
  timepoint,
  semester_label,
  COUNT(*) as response_count,
  ROUND(AVG(leadership_dna_mean), 2) as avg_leadership_dna,
  ROUND(AVG(excellence_mean), 2) as avg_excellence,
  ROUND(AVG(accountability_mean), 2) as avg_accountability,
  ROUND(AVG(discipline_mean), 2) as avg_discipline,
  ROUND(AVG(belonging_mean), 2) as avg_belonging,
  ROUND(AVG(composite_mean), 2) as avg_composite,
  ARRAY_AGG(optional_comment) FILTER (WHERE optional_comment IS NOT NULL) as comments
FROM public.peer_assessments
GROUP BY assessed_user_id, timepoint, semester_label
HAVING COUNT(*) >= 3;

-- RLS for the view
ALTER VIEW public.peer_feedback_aggregated SET (security_invoker = true);

-- Create function to get available teammates for peer assessment
CREATE OR REPLACE FUNCTION public.get_teammates_for_peer_assessment(
  _timepoint assessment_timepoint,
  _semester_label TEXT
)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  has_completed_self_assessment BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.user_id = p.id
        AND a.timepoint = _timepoint
        AND a.semester_label = _semester_label
    ) as has_completed_self_assessment
  FROM profiles p
  WHERE p.team_id IS NOT NULL
    AND p.team_id = (SELECT team_id FROM profiles WHERE id = auth.uid())
    AND p.id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM peer_assessments pa
      WHERE pa.assessor_id = auth.uid()
        AND pa.assessed_user_id = p.id
        AND pa.timepoint = _timepoint
        AND pa.semester_label = _semester_label
    )
  ORDER BY RANDOM()
  LIMIT 5;
$$;