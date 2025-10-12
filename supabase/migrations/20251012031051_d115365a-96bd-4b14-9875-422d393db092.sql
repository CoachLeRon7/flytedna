-- Add share_reflections column to assessments
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS share_reflections BOOLEAN DEFAULT true;