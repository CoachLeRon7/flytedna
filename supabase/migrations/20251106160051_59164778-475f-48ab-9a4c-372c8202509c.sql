-- Add registration type to profiles
ALTER TABLE public.profiles 
ADD COLUMN registration_type TEXT CHECK (registration_type IN ('team', 'individual')) DEFAULT 'team';

-- Create guardian_assessments table
CREATE TABLE public.guardian_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guardian_email TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_relationship TEXT NOT NULL CHECK (guardian_relationship IN ('parent', 'guardian', 'mentor', 'other')),
  
  -- Assessment context
  timepoint assessment_timepoint NOT NULL,
  semester_label TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  invitation_token UUID UNIQUE DEFAULT gen_random_uuid(),
  invitation_sent_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- 15 assessment questions (3 per domain)
  l1 INTEGER CHECK (l1 BETWEEN 1 AND 5),
  l2 INTEGER CHECK (l2 BETWEEN 1 AND 5),
  l3 INTEGER CHECK (l3 BETWEEN 1 AND 5),
  e1 INTEGER CHECK (e1 BETWEEN 1 AND 5),
  e2 INTEGER CHECK (e2 BETWEEN 1 AND 5),
  e3 INTEGER CHECK (e3 BETWEEN 1 AND 5),
  a1 INTEGER CHECK (a1 BETWEEN 1 AND 5),
  a2 INTEGER CHECK (a2 BETWEEN 1 AND 5),
  a3 INTEGER CHECK (a3 BETWEEN 1 AND 5),
  d1 INTEGER CHECK (d1 BETWEEN 1 AND 5),
  d2 INTEGER CHECK (d2 BETWEEN 1 AND 5),
  d3 INTEGER CHECK (d3 BETWEEN 1 AND 5),
  b1 INTEGER CHECK (b1 BETWEEN 1 AND 5),
  b2 INTEGER CHECK (b2 BETWEEN 1 AND 5),
  b3 INTEGER CHECK (b3 BETWEEN 1 AND 5),
  
  -- Calculated scores
  leadership_dna_mean NUMERIC,
  excellence_mean NUMERIC,
  accountability_mean NUMERIC,
  discipline_mean NUMERIC,
  belonging_mean NUMERIC,
  composite_mean NUMERIC,
  
  optional_comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guardian_assessments_athlete ON guardian_assessments(athlete_id);
CREATE INDEX idx_guardian_assessments_token ON guardian_assessments(invitation_token);
CREATE INDEX idx_guardian_assessments_timepoint ON guardian_assessments(athlete_id, timepoint, semester_label);

-- Enable RLS
ALTER TABLE public.guardian_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coaches and admins can manage guardian assessments"
ON guardian_assessments FOR ALL
USING (
  has_role(auth.uid(), 'admin') 
  OR (has_role(auth.uid(), 'coach') AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = guardian_assessments.athlete_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  ))
  OR auth.uid() = athlete_id
);

CREATE POLICY "Athletes can view their guardian assessments"
ON guardian_assessments FOR SELECT
USING (auth.uid() = athlete_id AND completed_at IS NOT NULL);

CREATE POLICY "Public can complete via invitation token"
ON guardian_assessments FOR UPDATE
USING (completed_at IS NULL);

-- Create trigger for computing guardian assessment scores
CREATE TRIGGER compute_guardian_scores
BEFORE INSERT OR UPDATE ON guardian_assessments
FOR EACH ROW
EXECUTE FUNCTION compute_coach_assessment_scores();

-- Create aggregated view for guardian feedback
CREATE OR REPLACE VIEW public.guardian_feedback_aggregated AS
SELECT 
  athlete_id,
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
FROM public.guardian_assessments
WHERE completed_at IS NOT NULL
GROUP BY athlete_id, timepoint, semester_label
HAVING COUNT(*) >= 1;

-- Update calculate_adjusted_composite to include guardian model
CREATE OR REPLACE FUNCTION public.calculate_adjusted_composite(_assessment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assessment_record RECORD;
  peer_avg numeric;
  guardian_avg numeric;
  coach_avg numeric;
  self_weight numeric := 0.60;
  peer_weight numeric := 0.15;
  coach_weight numeric := 0.25;
  guardian_weight numeric := 0.20;
  guardian_coach_weight numeric := 0.20;
  final_score numeric;
  peer_mod numeric := 0;
  coach_mod numeric := 0;
  user_age INTEGER;
  use_guardian_model BOOLEAN := false;
BEGIN
  -- Get the assessment with user age and registration type
  SELECT a.*, 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER as age,
         p.registration_type
  INTO assessment_record
  FROM assessments a
  JOIN profiles p ON a.user_id = p.id
  WHERE a.id = _assessment_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  user_age := assessment_record.age;
  -- Use guardian model if: individual registration AND age <= 19
  use_guardian_model := (assessment_record.registration_type = 'individual' AND user_age IS NOT NULL AND user_age <= 19);
  
  -- Get coach assessment
  SELECT composite_mean INTO coach_avg
  FROM coach_assessments
  WHERE athlete_id = assessment_record.user_id
    AND timepoint = assessment_record.timepoint
    AND semester_label = assessment_record.semester_label
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF use_guardian_model THEN
    -- Guardian Model: 60% self, 20% guardian, 20% coach
    SELECT avg_composite INTO guardian_avg
    FROM guardian_feedback_aggregated
    WHERE athlete_id = assessment_record.user_id
      AND timepoint = assessment_record.timepoint
      AND semester_label = assessment_record.semester_label
      AND response_count >= 1;
    
    IF guardian_avg IS NOT NULL AND coach_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * self_weight) + 
                     (guardian_avg * guardian_weight) + 
                     (coach_avg * guardian_coach_weight);
      peer_mod := guardian_avg - assessment_record.composite_mean;
      coach_mod := coach_avg - assessment_record.composite_mean;
    ELSIF guardian_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * 0.75) + (guardian_avg * 0.25);
      peer_mod := guardian_avg - assessment_record.composite_mean;
      coach_mod := 0;
    ELSIF coach_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * 0.75) + (coach_avg * 0.25);
      peer_mod := 0;
      coach_mod := coach_avg - assessment_record.composite_mean;
    ELSE
      final_score := assessment_record.composite_mean;
      peer_mod := 0;
      coach_mod := 0;
    END IF;
    
    UPDATE assessments
    SET 
      peer_adjusted_composite = guardian_avg,
      coach_adjusted_composite = coach_avg,
      final_composite_mean = ROUND(GREATEST(1.0, LEAST(5.0, final_score)), 2),
      peer_modifier = ROUND(peer_mod, 2),
      coach_modifier = ROUND(coach_mod, 2)
    WHERE id = _assessment_id;
    
  ELSE
    -- Peer Model (existing logic)
    SELECT avg_composite INTO peer_avg
    FROM peer_feedback_aggregated
    WHERE assessed_user_id = assessment_record.user_id
      AND timepoint = assessment_record.timepoint
      AND semester_label = assessment_record.semester_label
      AND response_count >= 3;
    
    IF peer_avg IS NOT NULL AND coach_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * self_weight) + 
                     (peer_avg * peer_weight) + 
                     (coach_avg * coach_weight);
      peer_mod := peer_avg - assessment_record.composite_mean;
      coach_mod := coach_avg - assessment_record.composite_mean;
    ELSIF peer_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * 0.80) + (peer_avg * 0.20);
      peer_mod := peer_avg - assessment_record.composite_mean;
      coach_mod := 0;
    ELSIF coach_avg IS NOT NULL THEN
      final_score := (assessment_record.composite_mean * 0.70) + (coach_avg * 0.30);
      peer_mod := 0;
      coach_mod := coach_avg - assessment_record.composite_mean;
    ELSE
      final_score := assessment_record.composite_mean;
      peer_mod := 0;
      coach_mod := 0;
    END IF;
    
    final_score := GREATEST(1.0, LEAST(5.0, final_score));
    
    UPDATE assessments
    SET 
      peer_adjusted_composite = peer_avg,
      coach_adjusted_composite = coach_avg,
      final_composite_mean = ROUND(final_score, 2),
      peer_modifier = ROUND(peer_mod, 2),
      coach_modifier = ROUND(coach_mod, 2)
    WHERE id = _assessment_id;
  END IF;
END;
$function$;

-- Trigger to recalculate on guardian assessment completion
CREATE OR REPLACE FUNCTION public.trigger_recalculate_on_guardian_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM calculate_adjusted_composite(a.id)
  FROM assessments a
  WHERE a.user_id = NEW.athlete_id
    AND a.timepoint = NEW.timepoint
    AND a.semester_label = NEW.semester_label;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER recalculate_on_guardian_assessment
AFTER INSERT OR UPDATE OF completed_at ON guardian_assessments
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION trigger_recalculate_on_guardian_assessment();