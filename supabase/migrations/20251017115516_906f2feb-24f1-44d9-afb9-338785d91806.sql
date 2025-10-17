-- Add new columns to assessments table for adjusted scoring
ALTER TABLE assessments 
  ADD COLUMN IF NOT EXISTS peer_adjusted_composite numeric,
  ADD COLUMN IF NOT EXISTS coach_adjusted_composite numeric,
  ADD COLUMN IF NOT EXISTS final_composite_mean numeric,
  ADD COLUMN IF NOT EXISTS peer_modifier numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coach_modifier numeric DEFAULT 0;

-- Create function to calculate adjusted composite scores
-- Weighting: 60% self, 15% peer, 25% coach
CREATE OR REPLACE FUNCTION calculate_adjusted_composite(_assessment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assessment_record RECORD;
  peer_avg numeric;
  coach_avg numeric;
  self_weight numeric := 0.60;
  peer_weight numeric := 0.15;
  coach_weight numeric := 0.25;
  final_score numeric;
  peer_mod numeric := 0;
  coach_mod numeric := 0;
BEGIN
  -- Get the assessment
  SELECT * INTO assessment_record
  FROM assessments
  WHERE id = _assessment_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get peer assessment average for this user/timepoint/semester
  SELECT avg_composite INTO peer_avg
  FROM peer_feedback_aggregated
  WHERE assessed_user_id = assessment_record.user_id
    AND timepoint = assessment_record.timepoint
    AND semester_label = assessment_record.semester_label
    AND response_count >= 3;  -- Minimum 3 peer responses
  
  -- Get coach assessment for this athlete/timepoint/semester (most recent if multiple)
  SELECT composite_mean INTO coach_avg
  FROM coach_assessments
  WHERE athlete_id = assessment_record.user_id
    AND timepoint = assessment_record.timepoint
    AND semester_label = assessment_record.semester_label
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate weighted average based on available data
  IF peer_avg IS NOT NULL AND coach_avg IS NOT NULL THEN
    -- All three scores available: 60% self, 15% peer, 25% coach
    final_score := (assessment_record.composite_mean * self_weight) + 
                   (peer_avg * peer_weight) + 
                   (coach_avg * coach_weight);
    peer_mod := peer_avg - assessment_record.composite_mean;
    coach_mod := coach_avg - assessment_record.composite_mean;
    
  ELSIF peer_avg IS NOT NULL THEN
    -- Only self and peer: redistribute weights (80% self, 20% peer)
    final_score := (assessment_record.composite_mean * 0.80) + (peer_avg * 0.20);
    peer_mod := peer_avg - assessment_record.composite_mean;
    coach_mod := 0;
    
  ELSIF coach_avg IS NOT NULL THEN
    -- Only self and coach: redistribute weights (70% self, 30% coach)
    final_score := (assessment_record.composite_mean * 0.70) + (coach_avg * 0.30);
    peer_mod := 0;
    coach_mod := coach_avg - assessment_record.composite_mean;
    
  ELSE
    -- Only self-assessment available
    final_score := assessment_record.composite_mean;
    peer_mod := 0;
    coach_mod := 0;
  END IF;
  
  -- Ensure final score stays within bounds (1.0 to 5.0)
  final_score := GREATEST(1.0, LEAST(5.0, final_score));
  
  -- Update the assessment with adjusted scores
  UPDATE assessments
  SET 
    peer_adjusted_composite = peer_avg,
    coach_adjusted_composite = coach_avg,
    final_composite_mean = ROUND(final_score, 2),
    peer_modifier = ROUND(peer_mod, 2),
    coach_modifier = ROUND(coach_mod, 2)
  WHERE id = _assessment_id;
END;
$function$;

-- Create trigger function for peer assessments
CREATE OR REPLACE FUNCTION trigger_recalculate_on_peer_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Recalculate for the assessed user
  PERFORM calculate_adjusted_composite(a.id)
  FROM assessments a
  WHERE a.user_id = NEW.assessed_user_id
    AND a.timepoint = NEW.timepoint
    AND a.semester_label = NEW.semester_label;
  
  RETURN NEW;
END;
$function$;

-- Create trigger function for coach assessments
CREATE OR REPLACE FUNCTION trigger_recalculate_on_coach_assessment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Recalculate for the athlete
  PERFORM calculate_adjusted_composite(a.id)
  FROM assessments a
  WHERE a.user_id = NEW.athlete_id
    AND a.timepoint = NEW.timepoint
    AND a.semester_label = NEW.semester_label;
  
  RETURN NEW;
END;
$function$;

-- Create triggers
DROP TRIGGER IF EXISTS recalculate_on_peer_assessment ON peer_assessments;
CREATE TRIGGER recalculate_on_peer_assessment
  AFTER INSERT OR UPDATE ON peer_assessments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_on_peer_assessment();

DROP TRIGGER IF EXISTS recalculate_on_coach_assessment ON coach_assessments;
CREATE TRIGGER recalculate_on_coach_assessment
  AFTER INSERT OR UPDATE ON coach_assessments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_on_coach_assessment();

-- Update existing compute_assessment_scores to initialize final_composite_mean
CREATE OR REPLACE FUNCTION public.compute_assessment_scores()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  l_mean NUMERIC;
  e_mean NUMERIC;
  a_mean NUMERIC;
  d_mean NUMERIC;
  b_mean NUMERIC;
  comp_mean NUMERIC;
  min_domain_score NUMERIC;
  risks TEXT[] := '{}';
BEGIN
  -- Calculate domain means
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0) + COALESCE(NEW.l4,0) + COALESCE(NEW.l5,0) + COALESCE(NEW.l6,0)) / 6.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0) + COALESCE(NEW.e4,0) + COALESCE(NEW.e5,0) + COALESCE(NEW.e6,0)) / 6.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0) + COALESCE(NEW.a4,0) + COALESCE(NEW.a5,0) + COALESCE(NEW.a6,0)) / 6.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0) + COALESCE(NEW.d4,0) + COALESCE(NEW.d5,0) + COALESCE(NEW.d6,0)) / 6.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0) + COALESCE(NEW.b4,0) + COALESCE(NEW.b5,0) + COALESCE(NEW.b6,0)) / 6.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  
  -- Find the minimum domain score
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Initialize final_composite_mean with self-assessment score
  -- Will be recalculated by triggers when peer/coach assessments exist
  NEW.final_composite_mean := ROUND(comp_mean, 2);
  
  -- Classification with stricter thresholds and domain minimums
  IF comp_mean >= 4.6 AND min_domain_score >= 4.5 THEN
    NEW.classification := 'Transformational';
  ELSIF comp_mean >= 3.9 AND min_domain_score >= 3.8 THEN
    NEW.classification := 'Emerging';
  ELSIF comp_mean >= 3.0 THEN
    NEW.classification := 'Developing';
  ELSIF comp_mean >= 2.5 THEN
    NEW.classification := 'Foundational';
  ELSE
    NEW.classification := 'Unanchored';
  END IF;
  
  -- Risk flags
  IF d_mean < 3.0 THEN
    risks := array_append(risks, 'low_discipline');
  END IF;
  
  IF b_mean < 3.0 THEN
    risks := array_append(risks, 'low_belonging');
  END IF;
  
  IF a_mean < 3.0 THEN
    risks := array_append(risks, 'low_accountability');
  END IF;

  IF l_mean < 3.0 THEN
    risks := array_append(risks, 'low_leadership_dna');
  END IF;

  IF e_mean < 3.0 THEN
    risks := array_append(risks, 'low_excellence');
  END IF;
  
  NEW.risk_flags := risks;
  
  RETURN NEW;
END;
$function$;