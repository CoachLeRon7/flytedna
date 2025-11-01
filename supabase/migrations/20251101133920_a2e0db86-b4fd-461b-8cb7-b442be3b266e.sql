-- Add ai_insights column to coach_assessments table
ALTER TABLE coach_assessments 
ADD COLUMN IF NOT EXISTS ai_insights JSONB DEFAULT NULL;

COMMENT ON COLUMN coach_assessments.ai_insights IS 'AI-generated breakdown of strengths, weaknesses, and action items based on coach assessment scores and reflections';