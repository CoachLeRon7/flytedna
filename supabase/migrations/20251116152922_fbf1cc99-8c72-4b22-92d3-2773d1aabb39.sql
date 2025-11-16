-- Add character length limits to assessment text fields

-- Self-assessments table
ALTER TABLE assessments
  ADD CONSTRAINT check_notes_private_length CHECK (notes_private IS NULL OR length(notes_private) <= 5000);

-- Peer assessments table
ALTER TABLE peer_assessments
  ADD CONSTRAINT check_optional_comment_length CHECK (optional_comment IS NULL OR length(optional_comment) <= 1000);

-- Coach assessments table
ALTER TABLE coach_assessments
  ADD CONSTRAINT check_reflection_voluntary_followership_length 
    CHECK (reflection_voluntary_followership IS NULL OR length(reflection_voluntary_followership) <= 2000),
  ADD CONSTRAINT check_reflection_greatest_impact_length 
    CHECK (reflection_greatest_impact IS NULL OR length(reflection_greatest_impact) <= 2000),
  ADD CONSTRAINT check_reflection_growth_area_length 
    CHECK (reflection_growth_area IS NULL OR length(reflection_growth_area) <= 2000);

-- Guardian assessments table
ALTER TABLE guardian_assessments
  ADD CONSTRAINT check_guardian_comment_length CHECK (optional_comment IS NULL OR length(optional_comment) <= 1000);

-- Note: For assessments.reflections (JSONB field), validation is handled client-side
-- as CHECK constraints can't easily validate string lengths within JSONB values