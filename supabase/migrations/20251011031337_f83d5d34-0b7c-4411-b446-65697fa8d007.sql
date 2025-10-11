-- Update the compute_assessment_scores function with new classification thresholds
CREATE OR REPLACE FUNCTION public.compute_assessment_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  l_mean NUMERIC;
  e_mean NUMERIC;
  a_mean NUMERIC;
  d_mean NUMERIC;
  b_mean NUMERIC;
  comp_mean NUMERIC;
BEGIN
  -- Calculate domain means
  l_mean := (COALESCE(NEW.L1,0) + COALESCE(NEW.L2,0) + COALESCE(NEW.L3,0) + COALESCE(NEW.L4,0) + COALESCE(NEW.L5,0) + COALESCE(NEW.L6,0)) / 6.0;
  e_mean := (COALESCE(NEW.E1,0) + COALESCE(NEW.E2,0) + COALESCE(NEW.E3,0) + COALESCE(NEW.E4,0) + COALESCE(NEW.E5,0) + COALESCE(NEW.E6,0)) / 6.0;
  a_mean := (COALESCE(NEW.A1,0) + COALESCE(NEW.A2,0) + COALESCE(NEW.A3,0) + COALESCE(NEW.A4,0) + COALESCE(NEW.A5,0) + COALESCE(NEW.A6,0)) / 6.0;
  d_mean := (COALESCE(NEW.D1,0) + COALESCE(NEW.D2,0) + COALESCE(NEW.D3,0) + COALESCE(NEW.D4,0) + COALESCE(NEW.D5,0) + COALESCE(NEW.D6,0)) / 6.0;
  b_mean := (COALESCE(NEW.B1,0) + COALESCE(NEW.B2,0) + COALESCE(NEW.B3,0) + COALESCE(NEW.B4,0) + COALESCE(NEW.B5,0) + COALESCE(NEW.B6,0)) / 6.0;
  
  -- Calculate composite mean (average of all 30 items)
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  
  -- Assign domain means
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Determine classification based on new thresholds
  IF comp_mean >= 4.5 THEN
    NEW.classification := 'Transformational';
  ELSIF comp_mean >= 3.5 THEN
    NEW.classification := 'Emerging';
  ELSIF comp_mean >= 2.5 THEN
    NEW.classification := 'Developing';
  ELSE
    NEW.classification := 'Foundational';
  END IF;
  
  RETURN NEW;
END;
$$;