-- Create enum types
CREATE TYPE public.user_role AS ENUM ('student', 'coach', 'admin');
CREATE TYPE public.assessment_timepoint AS ENUM ('pre', 'mid', 'end');
CREATE TYPE public.leadership_classification AS ENUM ('Foundational', 'Developing', 'Emerging', 'Transformational');
CREATE TYPE public.goal_status AS ENUM ('planned', 'in_progress', 'completed');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  sport TEXT,
  team_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role_team ON public.profiles(role, team_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Coaches and admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
  );

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  coach_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_name ON public.teams(name);

-- Add foreign key for team_id in profiles
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_team
  FOREIGN KEY (team_id)
  REFERENCES public.teams(id)
  ON DELETE SET NULL;

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Anyone can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Coaches and admins can manage teams"
  ON public.teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
  );

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  semester_label TEXT NOT NULL,
  timepoint assessment_timepoint NOT NULL,
  
  -- 30 assessment items (L1-L6, E1-E6, A1-A6, D1-D6, B1-B6)
  L1 INTEGER CHECK (L1 >= 1 AND L1 <= 5),
  L2 INTEGER CHECK (L2 >= 1 AND L2 <= 5),
  L3 INTEGER CHECK (L3 >= 1 AND L3 <= 5),
  L4 INTEGER CHECK (L4 >= 1 AND L4 <= 5),
  L5 INTEGER CHECK (L5 >= 1 AND L5 <= 5),
  L6 INTEGER CHECK (L6 >= 1 AND L6 <= 5),
  
  E1 INTEGER CHECK (E1 >= 1 AND E1 <= 5),
  E2 INTEGER CHECK (E2 >= 1 AND E2 <= 5),
  E3 INTEGER CHECK (E3 >= 1 AND E3 <= 5),
  E4 INTEGER CHECK (E4 >= 1 AND E4 <= 5),
  E5 INTEGER CHECK (E5 >= 1 AND E5 <= 5),
  E6 INTEGER CHECK (E6 >= 1 AND E6 <= 5),
  
  A1 INTEGER CHECK (A1 >= 1 AND A1 <= 5),
  A2 INTEGER CHECK (A2 >= 1 AND A2 <= 5),
  A3 INTEGER CHECK (A3 >= 1 AND A3 <= 5),
  A4 INTEGER CHECK (A4 >= 1 AND A4 <= 5),
  A5 INTEGER CHECK (A5 >= 1 AND A5 <= 5),
  A6 INTEGER CHECK (A6 >= 1 AND A6 <= 5),
  
  D1 INTEGER CHECK (D1 >= 1 AND D1 <= 5),
  D2 INTEGER CHECK (D2 >= 1 AND D2 <= 5),
  D3 INTEGER CHECK (D3 >= 1 AND D3 <= 5),
  D4 INTEGER CHECK (D4 >= 1 AND D4 <= 5),
  D5 INTEGER CHECK (D5 >= 1 AND D5 <= 5),
  D6 INTEGER CHECK (D6 >= 1 AND D6 <= 5),
  
  B1 INTEGER CHECK (B1 >= 1 AND B1 <= 5),
  B2 INTEGER CHECK (B2 >= 1 AND B2 <= 5),
  B3 INTEGER CHECK (B3 >= 1 AND B3 <= 5),
  B4 INTEGER CHECK (B4 >= 1 AND B4 <= 5),
  B5 INTEGER CHECK (B5 >= 1 AND B5 <= 5),
  B6 INTEGER CHECK (B6 >= 1 AND B6 <= 5),
  
  -- Computed scores
  leadership_dna_mean NUMERIC(4,2),
  excellence_mean NUMERIC(4,2),
  accountability_mean NUMERIC(4,2),
  discipline_mean NUMERIC(4,2),
  belonging_mean NUMERIC(4,2),
  composite_mean NUMERIC(4,2),
  classification leadership_classification,
  
  notes_private TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, semester_label, timepoint)
);

CREATE INDEX idx_assessments_user_sem_tp ON public.assessments(user_id, semester_label, timepoint);

-- Enable RLS on assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Assessments policies
CREATE POLICY "Users can view their own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches and admins can view all assessments"
  ON public.assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
  );

-- Create growth_plans table
CREATE TABLE public.growth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  semester_label TEXT NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, semester_label)
);

CREATE INDEX idx_growth_plans_user_sem ON public.growth_plans(user_id, semester_label);

-- Enable RLS on growth_plans
ALTER TABLE public.growth_plans ENABLE ROW LEVEL SECURITY;

-- Growth plans policies
CREATE POLICY "Users can view their own growth plans"
  ON public.growth_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own growth plans"
  ON public.growth_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth plans"
  ON public.growth_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches and admins can view all growth plans"
  ON public.growth_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('coach', 'admin')
    )
  );

-- Create function to compute assessment scores
CREATE OR REPLACE FUNCTION public.compute_assessment_scores()
RETURNS TRIGGER AS $$
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
  
  -- Calculate composite mean
  comp_mean := (l_mean + e_mean + a_mean + d_mean + b_mean) / 5.0;
  
  -- Assign values
  NEW.leadership_dna_mean := ROUND(l_mean, 2);
  NEW.excellence_mean := ROUND(e_mean, 2);
  NEW.accountability_mean := ROUND(a_mean, 2);
  NEW.discipline_mean := ROUND(d_mean, 2);
  NEW.belonging_mean := ROUND(b_mean, 2);
  NEW.composite_mean := ROUND(comp_mean, 2);
  
  -- Determine classification
  IF comp_mean >= 4.0 THEN
    NEW.classification := 'Transformational';
  ELSIF comp_mean >= 3.0 THEN
    NEW.classification := 'Emerging';
  ELSIF comp_mean >= 2.0 THEN
    NEW.classification := 'Developing';
  ELSE
    NEW.classification := 'Foundational';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to compute scores on insert/update
CREATE TRIGGER compute_scores_trigger
  BEFORE INSERT OR UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_assessment_scores();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, sport)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    NEW.raw_user_meta_data->>'sport'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_growth_plans_updated_at
  BEFORE UPDATE ON public.growth_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();