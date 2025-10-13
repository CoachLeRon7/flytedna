-- Create coach_assessments table for external leadership evaluation
CREATE TABLE IF NOT EXISTS public.coach_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_label TEXT NOT NULL,
  timepoint assessment_timepoint NOT NULL,
  
  -- Domain 1: Leadership DNA (3 questions)
  l1 INTEGER CHECK (l1 >= 1 AND l1 <= 5),
  l2 INTEGER CHECK (l2 >= 1 AND l2 <= 5),
  l3 INTEGER CHECK (l3 >= 1 AND l3 <= 5),
  
  -- Domain 2: Excellence (3 questions)
  e1 INTEGER CHECK (e1 >= 1 AND e1 <= 5),
  e2 INTEGER CHECK (e2 >= 1 AND e2 <= 5),
  e3 INTEGER CHECK (e3 >= 1 AND e3 <= 5),
  
  -- Domain 3: Accountability (3 questions)
  a1 INTEGER CHECK (a1 >= 1 AND a1 <= 5),
  a2 INTEGER CHECK (a2 >= 1 AND a2 <= 5),
  a3 INTEGER CHECK (a3 >= 1 AND a3 <= 5),
  
  -- Domain 4: Discipline (3 questions)
  d1 INTEGER CHECK (d1 >= 1 AND d1 <= 5),
  d2 INTEGER CHECK (d2 >= 1 AND d2 <= 5),
  d3 INTEGER CHECK (d3 >= 1 AND d3 <= 5),
  
  -- Domain 5: Belonging & Impact (3 questions)
  b1 INTEGER CHECK (b1 >= 1 AND b1 <= 5),
  b2 INTEGER CHECK (b2 >= 1 AND b2 <= 5),
  b3 INTEGER CHECK (b3 >= 1 AND b3 <= 5),
  
  -- Computed scores
  leadership_dna_mean NUMERIC,
  excellence_mean NUMERIC,
  accountability_mean NUMERIC,
  discipline_mean NUMERIC,
  belonging_mean NUMERIC,
  composite_mean NUMERIC,
  classification leadership_classification,
  
  -- Coach reflection prompts
  reflection_voluntary_followership TEXT,
  reflection_greatest_impact TEXT,
  reflection_growth_area TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure one assessment per coach per athlete per timepoint per semester
  UNIQUE(coach_id, athlete_id, timepoint, semester_label)
);

-- Enable RLS
ALTER TABLE public.coach_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coaches can view their own assessments"
  ON public.coach_assessments
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create assessments for athletes on their teams"
  ON public.coach_assessments
  FOR INSERT
  WITH CHECK (
    auth.uid() = coach_id 
    AND has_role(auth.uid(), 'coach')
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = athlete_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  );

CREATE POLICY "Coaches can update their own assessments"
  ON public.coach_assessments
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Admins can view all coach assessments"
  ON public.coach_assessments
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Computed scores trigger function for coach assessments
CREATE OR REPLACE FUNCTION public.compute_coach_assessment_scores()
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
BEGIN
  -- Calculate domain means (3 questions each)
  l_mean := (COALESCE(NEW.l1,0) + COALESCE(NEW.l2,0) + COALESCE(NEW.l3,0)) / 3.0;
  e_mean := (COALESCE(NEW.e1,0) + COALESCE(NEW.e2,0) + COALESCE(NEW.e3,0)) / 3.0;
  a_mean := (COALESCE(NEW.a1,0) + COALESCE(NEW.a2,0) + COALESCE(NEW.a3,0)) / 3.0;
  d_mean := (COALESCE(NEW.d1,0) + COALESCE(NEW.d2,0) + COALESCE(NEW.d3,0)) / 3.0;
  b_mean := (COALESCE(NEW.b1,0) + COALESCE(NEW.b2,0) + COALESCE(NEW.b3,0)) / 3.0;
  
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  
  -- Find the minimum domain score
  min_domain_score := LEAST(l_mean, e_mean, a_mean, d_mean, b_mean);
  
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Same classification logic as student assessments
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
  
  RETURN NEW;
END;
$$;

-- Create trigger for coach assessments
CREATE TRIGGER compute_coach_assessment_scores_trigger
  BEFORE INSERT OR UPDATE ON public.coach_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_coach_assessment_scores();

-- Add updated_at trigger
CREATE TRIGGER update_coach_assessments_updated_at
  BEFORE UPDATE ON public.coach_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();