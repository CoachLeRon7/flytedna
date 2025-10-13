-- Add 'Unanchored' to the leadership_classification enum
ALTER TYPE public.leadership_classification ADD VALUE IF NOT EXISTS 'Unanchored';

-- Update the compute_assessment_scores function with new stricter classification thresholds
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
  
  -- Classification with stricter thresholds and domain minimums
  -- Transformational: composite >= 4.6 AND lowest domain >= 4.5 (no weak spots)
  IF comp_mean >= 4.6 AND min_domain_score >= 4.5 THEN
    NEW.classification := 'Transformational';
  -- Emerging: composite >= 3.9 AND lowest domain >= 3.8
  ELSIF comp_mean >= 3.9 AND min_domain_score >= 3.8 THEN
    NEW.classification := 'Emerging';
  -- Developing: composite >= 3.0
  ELSIF comp_mean >= 3.0 THEN
    NEW.classification := 'Developing';
  -- Foundational: composite >= 2.5
  ELSIF comp_mean >= 2.5 THEN
    NEW.classification := 'Foundational';
  -- Unanchored: composite < 2.5
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
$$;