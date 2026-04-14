-- Create a secure view that masks guardian_email for non-admin users
CREATE OR REPLACE VIEW public.guardian_assessments_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  athlete_id,
  timepoint,
  semester_label,
  guardian_name,
  guardian_relationship,
  -- Mask email for non-admins
  CASE
    WHEN public.has_role(auth.uid(), 'admin') THEN guardian_email
    ELSE public.mask_email(invited_by, guardian_email, NULL::uuid)
  END AS guardian_email,
  -- Hide invitation token from non-admins
  CASE
    WHEN public.has_role(auth.uid(), 'admin') THEN invitation_token
    ELSE NULL
  END AS invitation_token,
  invited_by,
  l1, l2, l3,
  e1, e2, e3,
  a1, a2, a3,
  d1, d2, d3,
  b1, b2, b3,
  leadership_dna_mean,
  excellence_mean,
  accountability_mean,
  discipline_mean,
  belonging_mean,
  composite_mean,
  optional_comment,
  completed_at,
  invitation_sent_at,
  expires_at,
  created_at,
  updated_at
FROM public.guardian_assessments;

-- Drop the overly broad athlete policy from the raw table
DROP POLICY IF EXISTS "Athletes can view their guardian assessments" ON public.guardian_assessments;

-- Modify the broad ALL policy to remove athlete self-access (keep admin + coach only)
DROP POLICY IF EXISTS "Coaches and admins can manage guardian assessments" ON public.guardian_assessments;

CREATE POLICY "Admins and coaches can manage guardian assessments"
ON public.guardian_assessments
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR (
    has_role(auth.uid(), 'coach'::user_role)
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = guardian_assessments.athlete_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  )
);

-- Athletes can only INSERT (create invitation records for their own guardians)
CREATE POLICY "Athletes can create guardian assessment invitations"
ON public.guardian_assessments
FOR INSERT
WITH CHECK (auth.uid() = athlete_id);

-- Athletes can read their own guardian assessments (completed ones only) from the RAW table
-- but the app should use the safe view instead
CREATE POLICY "Athletes can view completed guardian assessments"
ON public.guardian_assessments
FOR SELECT
USING (auth.uid() = athlete_id AND completed_at IS NOT NULL);

-- Update the "Users can view guardian feedback" policy to be admin/coach only
DROP POLICY IF EXISTS "Users can view guardian feedback for their assessments" ON public.guardian_assessments;

CREATE POLICY "Admins and coaches can view guardian feedback"
ON public.guardian_assessments
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::user_role)
  OR (
    has_role(auth.uid(), 'coach'::user_role)
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = guardian_assessments.athlete_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  )
);