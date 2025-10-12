-- Drop existing trigger (correct name) and function
DROP TRIGGER IF EXISTS compute_scores_trigger ON public.assessments;
DROP FUNCTION IF EXISTS public.compute_assessment_scores();

-- Create updated function with new coaching insights and nudge creation
CREATE OR REPLACE FUNCTION public.compute_assessment_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  l_mean NUMERIC;
  e_mean NUMERIC;
  a_mean NUMERIC;
  d_mean NUMERIC;
  b_mean NUMERIC;
  comp_mean NUMERIC;
  risks TEXT[] := '{}';
  insights JSONB := '[]';
BEGIN
  -- Only process transformational edition
  IF NEW.edition != 'transformational' THEN
    RETURN NEW;
  END IF;

  -- Calculate domain means
  l_mean := (COALESCE(NEW.L1,0) + COALESCE(NEW.L2,0) + COALESCE(NEW.L3,0) + COALESCE(NEW.L4,0) + COALESCE(NEW.L5,0) + COALESCE(NEW.L6,0)) / 6.0;
  e_mean := (COALESCE(NEW.E1,0) + COALESCE(NEW.E2,0) + COALESCE(NEW.E3,0) + COALESCE(NEW.E4,0) + COALESCE(NEW.E5,0) + COALESCE(NEW.E6,0)) / 6.0;
  a_mean := (COALESCE(NEW.A1,0) + COALESCE(NEW.A2,0) + COALESCE(NEW.A3,0) + COALESCE(NEW.A4,0) + COALESCE(NEW.A5,0) + COALESCE(NEW.A6,0)) / 6.0;
  d_mean := (COALESCE(NEW.D1,0) + COALESCE(NEW.D2,0) + COALESCE(NEW.D3,0) + COALESCE(NEW.D4,0) + COALESCE(NEW.D5,0) + COALESCE(NEW.D6,0)) / 6.0;
  b_mean := (COALESCE(NEW.B1,0) + COALESCE(NEW.B2,0) + COALESCE(NEW.B3,0) + COALESCE(NEW.B4,0) + COALESCE(NEW.B5,0) + COALESCE(NEW.B6,0)) / 6.0;
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  
  -- Assign domain means
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Classification
  IF comp_mean < 2.5 THEN
    NEW.classification := 'Foundational';
  ELSIF comp_mean < 3.5 THEN
    NEW.classification := 'Developing';
  ELSIF comp_mean < 4.5 THEN
    NEW.classification := 'Emerging';
  ELSE
    NEW.classification := 'Transformational';
  END IF;
  
  -- Risk flags
  IF d_mean < 3.0 THEN
    risks := array_append(risks, 'low_discipline');
  END IF;
  
  IF a_mean < 3.0 THEN
    risks := array_append(risks, 'low_accountability');
  END IF;
  
  NEW.risk_flags := risks;
  
  -- Coaching insights based on thresholds
  IF l_mean < 3.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Leadership DNA',
      'level', 'low',
      'message', 'Courage reps over comfort: voice 1 unpopular truth this week and invite feedback.',
      'action', 'Ask a teammate for post-practice feedback on your tone.'
    );
  ELSIF l_mean < 4.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Leadership DNA',
      'level', 'mid',
      'message', 'Practice ''Reflect–Ask–Lead'': listen first, summarize, then propose next step.',
      'action', 'In next conflict, ask two questions before stating a solution.'
    );
  ELSE
    insights := insights || jsonb_build_object(
      'domain', 'Leadership DNA',
      'level', 'high',
      'message', 'Model conviction with care: teach a younger athlete how you prepare to speak up.',
      'action', 'Mentor 1 underclassman on pre-meeting prep.'
    );
  END IF;
  
  IF e_mean < 3.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Excellence',
      'level', 'low',
      'message', 'Align habits to goals: pick 3 weekly micro-habits that map to your big aims.',
      'action', 'Time-box 20 min daily for deep work.'
    );
  ELSIF e_mean < 4.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Excellence',
      'level', 'mid',
      'message', 'Busy ≠ productive: convert two tasks into focused blocks.',
      'action', 'Schedule 2 deep-work sessions this week.'
    );
  ELSE
    insights := insights || jsonb_build_object(
      'domain', 'Excellence',
      'level', 'high',
      'message', 'Share your review template with a teammate.',
      'action', 'Lead a 10-min standards huddle.'
    );
  END IF;
  
  IF a_mean < 3.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Accountability',
      'level', 'low',
      'message', 'Repair loop: own → apologize → action → 48h follow-up.',
      'action', 'Close every loop with an update within 48h.'
    );
  ELSIF a_mean < 4.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Accountability',
      'level', 'mid',
      'message', 'No defense: after critique, respond with 1 question + 1 action.',
      'action', 'Implement 1 change within 24h.'
    );
  ELSE
    insights := insights || jsonb_build_object(
      'domain', 'Accountability',
      'level', 'high',
      'message', 'Create a peer pact for one team standard.',
      'action', 'Draft a 1-paragraph pact and get 2 signatures.'
    );
  END IF;
  
  IF d_mean < 3.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Discipline',
      'level', 'low',
      'message', 'Set a baseline: 7h sleep, prep snacks, 2 phone-free blocks.',
      'action', 'Schedule DND blocks at 9am and 7pm.'
    );
  ELSIF d_mean < 4.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Discipline',
      'level', 'mid',
      'message', 'Delay gratification: trade one easy win for one hard habit daily.',
      'action', 'Replace scrolling with a 10-min recovery drill.'
    );
  ELSE
    insights := insights || jsonb_build_object(
      'domain', 'Discipline',
      'level', 'high',
      'message', 'Add mental reps: 5-min visualization before practice.',
      'action', 'Log 3 visualizations this week.'
    );
  END IF;
  
  IF b_mean < 3.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Belonging & Impact',
      'level', 'low',
      'message', 'Spotlight the unseen: two specific compliments to non-starters.',
      'action', 'Recognize one behind-the-scenes teammate daily.'
    );
  ELSIF b_mean < 4.0 THEN
    insights := insights || jsonb_build_object(
      'domain', 'Belonging & Impact',
      'level', 'mid',
      'message', 'Monthly service micro-action.',
      'action', 'Join one campus service hour this month.'
    );
  ELSE
    insights := insights || jsonb_build_object(
      'domain', 'Belonging & Impact',
      'level', 'high',
      'message', 'Design a small tradition that outlives you.',
      'action', 'Propose a team ritual and pilot it once.'
    );
  END IF;
  
  NEW.coaching_insights := insights;
  
  -- Create nudges for risk flags (only on INSERT)
  IF TG_OP = 'INSERT' THEN
    IF 'low_discipline' = ANY(risks) THEN
      INSERT INTO public.nudges (user_id, domain, title, body, frequency)
      VALUES (
        NEW.user_id,
        'Discipline',
        'Build Consistency',
        'Build consistency with 2 phone-free blocks daily.',
        'weekly'
      );
    END IF;
    
    IF 'low_accountability' = ANY(risks) THEN
      INSERT INTO public.nudges (user_id, domain, title, body, frequency)
      VALUES (
        NEW.user_id,
        'Accountability',
        'Close the Loop',
        'Close the loop within 48 hours after commitments.',
        'weekly'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER compute_scores_on_assessment
  BEFORE INSERT OR UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_assessment_scores();