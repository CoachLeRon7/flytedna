-- Add row-level locking to calculate_adjusted_composite to prevent race conditions
-- This ensures that concurrent peer/coach/guardian assessment submissions don't 
-- overwrite each other's calculations

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
  -- FOR UPDATE locks the row to prevent concurrent modifications
  SELECT a.*, 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER as age,
         p.registration_type
  INTO assessment_record
  FROM assessments a
  JOIN profiles p ON a.user_id = p.id
  WHERE a.id = _assessment_id
  FOR UPDATE OF a;  -- Lock the assessment row
  
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