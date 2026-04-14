
-- Update compute_assessment_scores to use 100-point scale
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
  user_age INTEGER;
  user_is_student_only BOOLEAN;
  raw_classification leadership_classification;
  age_capped_classification leadership_classification;
BEGIN
  -- Calculate domain means on 100-point scale (raw mean × 20)
  l_mean := ((COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0) + COALESCE(NEW.l4,0) + COALESCE(NEW.l5,0) + COALESCE(NEW.l6,0)) / 
    GREATEST(1, (CASE WHEN NEW.l1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.l2 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.l3 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.l4 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.l5 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.l6 IS NOT NULL THEN 1 ELSE 0 END))) * 20.0;
  
  e_mean := ((COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0) + COALESCE(NEW.e4,0) + COALESCE(NEW.e5,0) + COALESCE(NEW.e6,0)) / 
    GREATEST(1, (CASE WHEN NEW.e1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.e2 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.e3 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.e4 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.e5 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.e6 IS NOT NULL THEN 1 ELSE 0 END))) * 20.0;
  
  a_mean := ((COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0) + COALESCE(NEW.a4,0) + COALESCE(NEW.a5,0) + COALESCE(NEW.a6,0)) / 
    GREATEST(1, (CASE WHEN NEW.a1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.a2 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.a3 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.a4 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.a5 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.a6 IS NOT NULL THEN 1 ELSE 0 END))) * 20.0;
  
  d_mean := ((COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0) + COALESCE(NEW.d4,0) + COALESCE(NEW.d5,0) + COALESCE(NEW.d6,0)) / 
    GREATEST(1, (CASE WHEN NEW.d1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.d2 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.d3 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.d4 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.d5 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.d6 IS NOT NULL THEN 1 ELSE 0 END))) * 20.0;
  
  b_mean := ((COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0) + COALESCE(NEW.b4,0) + COALESCE(NEW.b5,0) + COALESCE(NEW.b6,0)) / 
    GREATEST(1, (CASE WHEN NEW.b1 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.b2 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.b3 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.b4 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.b5 IS NOT NULL THEN 1 ELSE 0 END + CASE WHEN NEW.b6 IS NOT NULL THEN 1 ELSE 0 END))) * 20.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  NEW.final_composite_mean := ROUND(comp_mean, 2);
  
  -- Classification on 100-point scale
  IF comp_mean >= 85 AND min_domain_score >= 80 THEN
    raw_classification := 'Transformational';
  ELSIF comp_mean >= 70 AND min_domain_score >= 65 THEN
    raw_classification := 'Emerging';
  ELSIF comp_mean >= 50 THEN
    raw_classification := 'Developing';
  ELSE
    raw_classification := 'Foundational';
  END IF;
  
  -- Check if user is student-only
  SELECT NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = NEW.user_id
    AND role IN ('coach', 'admin')
  ) INTO user_is_student_only;
  
  -- Get user's age
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Apply developmental scaling for student athletes
  IF user_age IS NOT NULL AND user_is_student_only THEN
    IF user_age < 15 THEN
      age_capped_classification := LEAST(raw_classification, 'Foundational'::leadership_classification);
    ELSIF user_age < 17 THEN
      age_capped_classification := LEAST(raw_classification, 'Developing'::leadership_classification);
    ELSIF user_age < 19 THEN
      age_capped_classification := LEAST(raw_classification, 'Emerging'::leadership_classification);
    ELSE
      age_capped_classification := raw_classification;
    END IF;
    NEW.classification := age_capped_classification;
  ELSE
    NEW.classification := raw_classification;
  END IF;
  
  -- Risk flags on 100-point scale
  IF d_mean < 60 THEN risks := array_append(risks, 'low_discipline'); END IF;
  IF b_mean < 60 THEN risks := array_append(risks, 'low_belonging'); END IF;
  IF a_mean < 60 THEN risks := array_append(risks, 'low_accountability'); END IF;
  IF l_mean < 60 THEN risks := array_append(risks, 'low_leadership_dna'); END IF;
  IF e_mean < 60 THEN risks := array_append(risks, 'low_excellence'); END IF;
  
  NEW.risk_flags := risks;
  
  RETURN NEW;
END;
$function$;

-- Update compute_peer_assessment_scores to use 100-point scale
CREATE OR REPLACE FUNCTION public.compute_peer_assessment_scores()
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
  user_age INTEGER;
  assessed_is_student_only BOOLEAN;
  raw_classification leadership_classification;
  age_capped_classification leadership_classification;
BEGIN
  -- Calculate domain means on 100-point scale
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0)) / 3.0 * 20.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0)) / 3.0 * 20.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0)) / 3.0 * 20.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0)) / 3.0 * 20.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0)) / 3.0 * 20.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Classification on 100-point scale
  IF comp_mean >= 85 AND min_domain_score >= 80 THEN
    raw_classification := 'Transformational';
  ELSIF comp_mean >= 70 AND min_domain_score >= 65 THEN
    raw_classification := 'Emerging';
  ELSIF comp_mean >= 50 THEN
    raw_classification := 'Developing';
  ELSE
    raw_classification := 'Foundational';
  END IF;
  
  -- Check if assessed user is student-only
  SELECT NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = NEW.assessed_user_id
    AND role IN ('coach', 'admin')
  ) INTO assessed_is_student_only;
  
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.assessed_user_id;
  
  IF user_age IS NOT NULL AND assessed_is_student_only THEN
    IF user_age < 15 THEN
      age_capped_classification := LEAST(raw_classification, 'Foundational'::leadership_classification);
    ELSIF user_age < 17 THEN
      age_capped_classification := LEAST(raw_classification, 'Developing'::leadership_classification);
    ELSIF user_age < 19 THEN
      age_capped_classification := LEAST(raw_classification, 'Emerging'::leadership_classification);
    ELSE
      age_capped_classification := raw_classification;
    END IF;
    NEW.classification := age_capped_classification;
  ELSE
    NEW.classification := raw_classification;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update compute_coach_assessment_scores to use 100-point scale
CREATE OR REPLACE FUNCTION public.compute_coach_assessment_scores()
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
  user_age INTEGER;
  athlete_is_student_only BOOLEAN;
  raw_classification leadership_classification;
  age_capped_classification leadership_classification;
BEGIN
  -- Calculate domain means on 100-point scale
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0)) / 3.0 * 20.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0)) / 3.0 * 20.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0)) / 3.0 * 20.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0)) / 3.0 * 20.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0)) / 3.0 * 20.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Classification on 100-point scale
  IF comp_mean >= 85 AND min_domain_score >= 80 THEN
    raw_classification := 'Transformational';
  ELSIF comp_mean >= 70 AND min_domain_score >= 65 THEN
    raw_classification := 'Emerging';
  ELSIF comp_mean >= 50 THEN
    raw_classification := 'Developing';
  ELSE
    raw_classification := 'Foundational';
  END IF;
  
  SELECT NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = NEW.athlete_id
    AND role IN ('coach', 'admin')
  ) INTO athlete_is_student_only;
  
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.athlete_id;
  
  IF user_age IS NOT NULL AND athlete_is_student_only THEN
    IF user_age < 15 THEN
      age_capped_classification := LEAST(raw_classification, 'Foundational'::leadership_classification);
    ELSIF user_age < 17 THEN
      age_capped_classification := LEAST(raw_classification, 'Developing'::leadership_classification);
    ELSIF user_age < 19 THEN
      age_capped_classification := LEAST(raw_classification, 'Emerging'::leadership_classification);
    ELSE
      age_capped_classification := raw_classification;
    END IF;
    NEW.classification := age_capped_classification;
  ELSE
    NEW.classification := raw_classification;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update calculate_adjusted_composite for 100-point scale
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
  SELECT a.*, 
         EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER as age,
         p.registration_type
  INTO assessment_record
  FROM assessments a
  JOIN profiles p ON a.user_id = p.id
  WHERE a.id = _assessment_id
  FOR UPDATE OF a;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  user_age := assessment_record.age;
  use_guardian_model := (assessment_record.registration_type = 'individual' AND user_age IS NOT NULL AND user_age <= 19);
  
  SELECT composite_mean INTO coach_avg
  FROM coach_assessments
  WHERE athlete_id = assessment_record.user_id
    AND timepoint = assessment_record.timepoint
    AND semester_label = assessment_record.semester_label
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF use_guardian_model THEN
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
      final_composite_mean = ROUND(GREATEST(20.0, LEAST(100.0, final_score)), 2),
      peer_modifier = ROUND(peer_mod, 2),
      coach_modifier = ROUND(coach_mod, 2)
    WHERE id = _assessment_id;
    
  ELSE
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
    
    final_score := GREATEST(20.0, LEAST(100.0, final_score));
    
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
