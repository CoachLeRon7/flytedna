-- Enable RLS on guardian_feedback_aggregated view
ALTER VIEW public.guardian_feedback_aggregated SET (security_invoker = true);

-- Add RLS policy for viewing aggregated guardian feedback
CREATE POLICY "Users can view guardian feedback for their assessments"
ON guardian_assessments FOR SELECT
USING (
  auth.uid() = athlete_id 
  OR has_role(auth.uid(), 'admin')
  OR (has_role(auth.uid(), 'coach') AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = guardian_assessments.athlete_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  ))
);