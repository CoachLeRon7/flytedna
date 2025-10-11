-- Create enum types for new fields
CREATE TYPE assessment_edition AS ENUM ('standard', 'transformational');
CREATE TYPE nudge_frequency AS ENUM ('daily', 'weekly');
CREATE TYPE nudge_status AS ENUM ('scheduled', 'sent', 'snoozed', 'completed');

-- Add new fields to assessments table
ALTER TABLE public.assessments 
  ADD COLUMN edition assessment_edition DEFAULT 'transformational',
  ADD COLUMN reflections JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN coaching_insights JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN risk_flags TEXT[] DEFAULT '{}';

-- Create nudges table
CREATE TABLE public.nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  frequency nudge_frequency NOT NULL,
  status nudge_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on nudges
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for nudges
CREATE POLICY "Users can view their own nudges"
  ON public.nudges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nudges"
  ON public.nudges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges"
  ON public.nudges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nudges"
  ON public.nudges FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches and admins can view all nudges"
  ON public.nudges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );

CREATE POLICY "Coaches and admins can manage all nudges"
  ON public.nudges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
  );