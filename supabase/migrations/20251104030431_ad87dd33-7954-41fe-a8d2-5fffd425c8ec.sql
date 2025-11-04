-- Add date_of_birth to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_of_birth DATE;

COMMENT ON COLUMN public.profiles.date_of_birth IS 
  'Date of birth for age-based developmental scaling in leadership assessments';

-- Add check constraint to prevent unrealistic dates
ALTER TABLE public.profiles
ADD CONSTRAINT check_reasonable_birthdate 
CHECK (
  date_of_birth IS NULL OR 
  (date_of_birth >= '1900-01-01' AND date_of_birth <= CURRENT_DATE)
);

-- Update compute_assessment_scores to include age-based developmental scaling
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
  raw_classification leadership_classification;
  age_capped_classification leadership_classification;
BEGIN
  -- Calculate domain means
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0) + COALESCE(NEW.l4,0) + COALESCE(NEW.l5,0) + COALESCE(NEW.l6,0)) / 6.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0) + COALESCE(NEW.e4,0) + COALESCE(NEW.e5,0) + COALESCE(NEW.e6,0)) / 6.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0) + COALESCE(NEW.a4,0) + COALESCE(NEW.a5,0) + COALESCE(NEW.a6,0)) / 6.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0) + COALESCE(NEW.d4,0) + COALESCE(NEW.d5,0) + COALESCE(NEW.d6,0)) / 6.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0) + COALESCE(NEW.b4,0) + COALESCE(NEW.b5,0) + COALESCE(NEW.b6,0)) / 6.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  NEW.final_composite_mean := ROUND(comp_mean, 2);
  
  -- Calculate raw classification (score-based only)
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
  
  -- Get user's age if date_of_birth exists
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Apply developmental scaling based on age
  IF user_age IS NOT NULL THEN
    IF user_age < 15 THEN
      -- Ages 12-14: Cap at Foundational
      age_capped_classification := LEAST(raw_classification, 'Foundational'::leadership_classification);
    ELSIF user_age < 17 THEN
      -- Ages 15-16: Cap at Developing
      age_capped_classification := LEAST(raw_classification, 'Developing'::leadership_classification);
    ELSIF user_age < 19 THEN
      -- Ages 17-18: Cap at Emerging
      age_capped_classification := LEAST(raw_classification, 'Emerging'::leadership_classification);
    ELSE
      -- Ages 19+: No cap, full range available
      age_capped_classification := raw_classification;
    END IF;
    NEW.classification := age_capped_classification;
  ELSE
    -- No age data: use raw classification
    NEW.classification := raw_classification;
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

-- Update compute_coach_assessment_scores to include age-based developmental scaling
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
  raw_classification leadership_classification;
  age_capped_classification leadership_classification;
BEGIN
  -- Calculate domain means (3 questions each for coach)
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
  
  -- Get athlete's age
  SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth))::INTEGER
  INTO user_age
  FROM profiles p
  WHERE p.id = NEW.athlete_id;
  
  -- Apply developmental scaling
  IF user_age IS NOT NULL THEN
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

-- Update handle_new_user to store date_of_birth from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role user_role;
  admin_count INTEGER;
  is_first_admin BOOLEAN := FALSE;
BEGIN
  requested_role := (NEW.raw_user_meta_data->>'role')::user_role;
  
  SELECT COUNT(*) INTO admin_count FROM user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    is_first_admin := TRUE;
  END IF;
  
  INSERT INTO public.profiles (id, email, first_name, last_name, sport, date_of_birth)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'sport',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );
  
  IF is_first_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSIF requested_role IS NOT NULL THEN
    IF requested_role = 'admin' THEN
      INSERT INTO public.pending_role_requests (user_id, requested_role, status)
      VALUES (NEW.id, requested_role, 'pending');
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, requested_role);
    END IF;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');
  END IF;
  
  RETURN NEW;
END;
$function$;