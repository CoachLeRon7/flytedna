-- =====================================================================
-- FlyteDNA Leadership Intelligence — Phase 1 Foundation
-- Catalog tables: houses, leadership_traits, house_trait_weights
-- Question/option bank tables (forward-looking, populated in Phase 2)
-- Per-assessment scoring tables: assessment_trait_scores, house_placements
-- =====================================================================

-- -------------------- CATALOG: HOUSES --------------------
CREATE TABLE public.houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  leadership_style text,
  description text,
  color_hex text,
  symbol text,
  oath text,
  core_traits text[] NOT NULL DEFAULT '{}',
  growth_areas text[] NOT NULL DEFAULT '{}',
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active houses"
  ON public.houses FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage houses"
  ON public.houses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- -------------------- CATALOG: TRAITS --------------------
CREATE TYPE public.trait_category AS ENUM ('readiness', 'dna', 'meta');

CREATE TABLE public.leadership_traits (
  trait_key text PRIMARY KEY,
  display_name text NOT NULL,
  category trait_category NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leadership_traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view traits"
  ON public.leadership_traits FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage traits"
  ON public.leadership_traits FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- -------------------- HOUSE <-> TRAIT WEIGHTS --------------------
CREATE TABLE public.house_trait_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id uuid NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  trait_key text NOT NULL REFERENCES public.leadership_traits(trait_key) ON DELETE CASCADE,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (house_id, trait_key)
);

ALTER TABLE public.house_trait_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view house trait weights"
  ON public.house_trait_weights FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage house trait weights"
  ON public.house_trait_weights FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- -------------------- QUESTION BANK (Phase 2 populates) --------------------
CREATE TYPE public.question_kind AS ENUM ('scenario', 'preference', 'reflection', 'mirror');

CREATE TABLE public.assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  kind question_kind NOT NULL DEFAULT 'scenario',
  weight_multiplier numeric NOT NULL DEFAULT 1.0,
  -- For mirror/contradiction analysis: pair questions that test same construct
  mirror_group text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active questions"
  ON public.assessment_questions FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins manage questions"
  ON public.assessment_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view question options"
  ON public.question_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage question options"
  ON public.question_options FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE TABLE public.option_trait_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id uuid NOT NULL REFERENCES public.question_options(id) ON DELETE CASCADE,
  trait_key text NOT NULL REFERENCES public.leadership_traits(trait_key) ON DELETE CASCADE,
  weight numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (option_id, trait_key)
);

ALTER TABLE public.option_trait_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view option weights"
  ON public.option_trait_weights FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage option weights"
  ON public.option_trait_weights FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- -------------------- PER-ASSESSMENT SCORING --------------------
CREATE TABLE public.assessment_trait_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  trait_key text NOT NULL REFERENCES public.leadership_traits(trait_key) ON DELETE CASCADE,
  raw_score numeric NOT NULL DEFAULT 0,
  normalized_score numeric NOT NULL DEFAULT 0, -- 0-100
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, trait_key)
);

CREATE INDEX idx_trait_scores_user ON public.assessment_trait_scores(user_id);
CREATE INDEX idx_trait_scores_assessment ON public.assessment_trait_scores(assessment_id);

ALTER TABLE public.assessment_trait_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own trait scores"
  ON public.assessment_trait_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches view team trait scores"
  ON public.assessment_trait_scores FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'coach'::user_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = assessment_trait_scores.user_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  );

CREATE POLICY "Admins view all trait scores"
  ON public.assessment_trait_scores FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Service role manages trait scores"
  ON public.assessment_trait_scores FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- -------------------- HOUSE PLACEMENTS --------------------
CREATE TABLE public.house_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  primary_house_id uuid REFERENCES public.houses(id),
  secondary_house_id uuid REFERENCES public.houses(id),
  -- Full probability vector for all houses {house_slug: probability_0_to_100}
  probability_vector jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_confidence numeric, -- 0-100, gap between #1 and #2
  consistency_score numeric, -- 0-100 authenticity signal across mirror questions
  leadership_level text, -- 'Foundational' | 'Developing' | 'Emerging' | 'Transformational'
  readiness_composite numeric, -- 0-100
  insights jsonb NOT NULL DEFAULT '{}'::jsonb, -- coaching recs, gaps
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id)
);

CREATE INDEX idx_house_placements_user ON public.house_placements(user_id);
CREATE INDEX idx_house_placements_primary ON public.house_placements(primary_house_id);

ALTER TABLE public.house_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own placements"
  ON public.house_placements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches view team placements"
  ON public.house_placements FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'coach'::user_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = house_placements.user_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  );

CREATE POLICY "Admins view all placements"
  ON public.house_placements FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Service role manages placements"
  ON public.house_placements FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- -------------------- TIMESTAMPS TRIGGERS --------------------
CREATE TRIGGER trg_houses_updated_at
  BEFORE UPDATE ON public.houses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_assessment_questions_updated_at
  BEFORE UPDATE ON public.assessment_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- SEED: TRAITS
-- =====================================================================
INSERT INTO public.leadership_traits (trait_key, display_name, category, description, display_order) VALUES
  -- Readiness traits
  ('discipline',           'Discipline',           'readiness', 'Consistent self-governance and follow-through.', 1),
  ('consistency',          'Consistency',          'readiness', 'Stable performance across time and situations.', 2),
  ('emotional_regulation', 'Emotional Regulation', 'readiness', 'Manages emotional response under pressure.', 3),
  ('accountability',       'Accountability',       'readiness', 'Owns outcomes — successes and failures.', 4),
  ('resilience',           'Resilience',           'readiness', 'Recovers and adapts after setbacks.', 5),
  ('initiative',           'Initiative',           'readiness', 'Acts without needing prompting.', 6),
  ('self_awareness',       'Self-Awareness',       'readiness', 'Accurate perception of own behavior and impact.', 7),
  ('follow_through',       'Follow-Through',       'readiness', 'Completes what is started.', 8),
  ('responsibility',       'Responsibility',       'readiness', 'Reliably carries assigned and chosen duties.', 9),
  ('maturity',             'Maturity',             'readiness', 'Composed, reflective decision-making.', 10),

  -- DNA traits — Valor
  ('courage',              'Courage',              'dna', 'Acts in the presence of fear or risk.', 20),
  ('competitive_drive',    'Competitive Drive',    'dna', 'Energized by challenge and competition.', 21),
  ('confidence_pressure',  'Confidence Under Pressure', 'dna', 'Steady performance in high-stakes moments.', 22),

  -- DNA traits — Forged
  ('structure',            'Structure',            'dna', 'Builds and follows systems and routines.', 30),
  ('work_ethic',           'Work Ethic',           'dna', 'Sustained effort and preparation.', 31),

  -- DNA traits — Pulse
  ('empathy',              'Empathy',              'dna', 'Reads and shares others'' emotional states.', 40),
  ('connection',           'Connection',           'dna', 'Builds relationships and belonging.', 41),
  ('encouragement',        'Encouragement',        'dna', 'Lifts others through support and affirmation.', 42),
  ('emotional_intelligence','Emotional Intelligence','dna','Decodes social and emotional dynamics.', 43),

  -- DNA traits — Vision
  ('strategy',             'Strategic Thinking',   'dna', 'Sees patterns and plans paths forward.', 50),
  ('foresight',            'Foresight',            'dna', 'Anticipates consequences and possibilities.', 51),
  ('wisdom',               'Wisdom',               'dna', 'Applies experience and judgment.', 52),

  -- DNA traits — Nova
  ('creativity',           'Creativity',           'dna', 'Generates novel ideas and approaches.', 60),
  ('innovation',           'Innovation',           'dna', 'Transforms ideas into useful change.', 61),
  ('adaptability',         'Adaptability',         'dna', 'Adjusts quickly to changing context.', 62),
  ('imagination',          'Imagination',          'dna', 'Envisions what does not yet exist.', 63),

  -- DNA traits — Rise
  ('growth_mindset',       'Growth Mindset',       'dna', 'Believes ability is built through effort.', 70),
  ('ambition',             'Ambition',             'dna', 'Reaches for higher outcomes.', 71),
  ('perseverance',         'Perseverance',         'dna', 'Stays with a goal across difficulty.', 72),

  -- DNA traits — Anchor
  ('stability',            'Stability',            'dna', 'Provides a steady presence for others.', 80),
  ('loyalty',              'Loyalty',              'dna', 'Sustained commitment to people and team.', 81),
  ('calmness',             'Calmness',             'dna', 'Even-keeled under stress.', 82),
  ('trustworthiness',      'Trustworthiness',      'dna', 'Earns and keeps trust through reliability.', 83),

  -- DNA traits — Crown
  ('influence',            'Influence',            'dna', 'Shifts behavior and belief in others.', 90),
  ('excellence',           'Excellence',           'dna', 'Holds elevated standards.', 91),
  ('presence',             'Presence',             'dna', 'Commands attention and respect.', 92),
  ('legacy',               'Legacy',               'dna', 'Acts with long-term impact in mind.', 93),

  -- Meta signals
  ('leadership_confidence','Leadership Confidence','meta','Belief in own capacity to lead.', 100),
  ('problem_solving',      'Problem Solving',      'meta','Resolves novel challenges.', 101),
  ('transformational_potential','Transformational Potential','meta','Capacity for catalytic leadership growth.', 102);

-- =====================================================================
-- SEED: HOUSES
-- =====================================================================
INSERT INTO public.houses (slug, name, tagline, leadership_style, color_hex, symbol, core_traits, growth_areas, display_order) VALUES
  ('valor',  'House Valor',  'Lead from the front.',
   'Leads from the front. Naturally steps into difficult situations. Protective, action-oriented, challenge-driven.',
   '#C8102E', 'sword',
   ARRAY['courage','accountability','initiative','competitive_drive','confidence_pressure'],
   ARRAY['patience','emotional_awareness','collaboration_balance','listening'], 1),

  ('forged', 'House Forged', 'Built through repetition.',
   'Leads through reliability and standards. Builds trust through consistency and preparation.',
   '#6B4423', 'anvil',
   ARRAY['discipline','consistency','resilience','work_ethic','structure'],
   ARRAY['flexibility','creativity','emotional_openness','adaptability'], 2),

  ('pulse',  'House Pulse',  'Lead with heart.',
   'Leads through emotional influence and connection. Creates belonging and strengthens team culture.',
   '#E5446D', 'heart',
   ARRAY['empathy','emotional_intelligence','connection','encouragement'],
   ARRAY['assertiveness','decisiveness','confidence_in_confrontation'], 3),

  ('vision', 'House Vision', 'See further. Lead clearer.',
   'Leads through direction and clarity. Sees patterns, possibilities, and future outcomes.',
   '#2E5EAA', 'eye',
   ARRAY['strategy','foresight','wisdom'],
   ARRAY['execution_speed','emotional_expression','immediate_action'], 4),

  ('nova',   'House Nova',   'Create what does not yet exist.',
   'Leads through ideas, innovation, and possibility. Thrives where creativity is required.',
   '#7C3AED', 'spark',
   ARRAY['creativity','innovation','imagination','adaptability'],
   ARRAY['consistency','structure','follow_through','focus'], 5),

  ('rise',   'House Rise',   'Grow without ceiling.',
   'Leads through transformation and continual improvement. Believes growth is always possible.',
   '#F59E0B', 'mountain',
   ARRAY['growth_mindset','ambition','perseverance'],
   ARRAY['patience','reflection','burnout_awareness'], 6),

  ('anchor', 'House Anchor', 'Be the steady force.',
   'Leads through steadiness and support. Serves as an emotional and cultural foundation for others.',
   '#1F4E5F', 'anchor',
   ARRAY['stability','loyalty','calmness','trustworthiness'],
   ARRAY['visibility','voice','risk_taking'], 7),

  ('crown',  'House Crown',  'Lead with legacy in mind.',
   'Leads through example, responsibility, and impact. Represents leadership stewardship.',
   '#D4AF37', 'crown',
   ARRAY['influence','excellence','responsibility','presence','legacy'],
   ARRAY['humility','delegation','vulnerability','collaborative_leadership'], 8);

-- =====================================================================
-- SEED: HOUSE <-> TRAIT WEIGHTS
-- =====================================================================
INSERT INTO public.house_trait_weights (house_id, trait_key, weight)
SELECT h.id, t.trait_key, t.weight FROM (VALUES
  -- Valor
  ('valor','courage',3),('valor','competitive_drive',3),('valor','confidence_pressure',3),
  ('valor','initiative',2),('valor','accountability',2),('valor','leadership_confidence',2),
  -- Forged
  ('forged','discipline',3),('forged','consistency',3),('forged','work_ethic',3),
  ('forged','structure',3),('forged','resilience',2),('forged','follow_through',2),
  -- Pulse
  ('pulse','empathy',3),('pulse','emotional_intelligence',3),('pulse','connection',3),
  ('pulse','encouragement',3),('pulse','emotional_regulation',1),
  -- Vision
  ('vision','strategy',3),('vision','foresight',3),('vision','wisdom',3),
  ('vision','self_awareness',2),('vision','problem_solving',2),
  -- Nova
  ('nova','creativity',3),('nova','innovation',3),('nova','imagination',3),
  ('nova','adaptability',3),('nova','problem_solving',2),
  -- Rise
  ('rise','growth_mindset',3),('rise','ambition',3),('rise','perseverance',3),
  ('rise','resilience',2),('rise','transformational_potential',2),
  -- Anchor
  ('anchor','stability',3),('anchor','loyalty',3),('anchor','calmness',3),
  ('anchor','trustworthiness',3),('anchor','emotional_regulation',1),
  -- Crown
  ('crown','influence',3),('crown','excellence',3),('crown','presence',3),
  ('crown','legacy',3),('crown','responsibility',2),('crown','maturity',2)
) AS t(house_slug, trait_key, weight)
JOIN public.houses h ON h.slug = t.house_slug;