-- Drop the existing coach policy that doesn't respect share_reflections
DROP POLICY IF EXISTS "Coaches can view assessments for students on their teams" ON public.assessments;

-- Create new coach policy that respects the share_reflections flag
-- Coaches can only view assessments where the student has chosen to share (share_reflections = true)
-- OR where share_reflections is NULL (for backwards compatibility with existing data)
CREATE POLICY "Coaches can view shared assessments for students on their teams"
ON public.assessments
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND has_role(auth.uid(), 'coach'::user_role) 
  AND (share_reflections = true OR share_reflections IS NULL)
  AND EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = assessments.user_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  )
);