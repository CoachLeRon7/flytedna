-- Drop the incorrectly configured trigger on peer_assessments
DROP TRIGGER IF EXISTS compute_peer_assessment_scores ON peer_assessments;

-- Create proper peer assessment scoring function
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
  -- Calculate domain means (3 questions each for peer)
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0)) / 3.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0)) / 3.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0)) / 3.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0)) / 3.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0)) / 3.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Calculate raw classification
  IF comp_mean >= 4.6 AND min_domain_score >= 4.5 THEN
    raw_classification := 'Transformational';
  ELSIF comp_mean >= 3.9 AND min_domain_score >= 3.8 THEN
    raw_classification := 'Emerging';
  ELSIF comp_mean >= 3.0 THEN
    raw_classification := 'Developing';
  ELSIF comp_mean >= 2.5 THEN
    raw_classification := 'Foundational';
  ELSE
    raw_classification := 'Unanchored';
  END IF;
  
  -- Check if assessed user is student-only (not coach or admin)
  SELECT NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = NEW.assessed_user_id
    AND role IN ('coach', 'admin')
  ) INTO assessed_is_student_only;
  
  -- Get assessed user's age
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.assessed_user_id;
  
  -- Apply developmental scaling ONLY for student athletes
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

-- Create correct trigger for peer assessments
CREATE TRIGGER compute_peer_assessment_scores
BEFORE INSERT OR UPDATE ON peer_assessments
FOR EACH ROW
EXECUTE FUNCTION compute_peer_assessment_scores();