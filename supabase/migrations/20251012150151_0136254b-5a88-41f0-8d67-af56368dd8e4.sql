-- Fix assessments table policies to explicitly require authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can create their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Coaches can view shared assessments for students on their teams" ON public.assessments;

-- Recreate policies with TO authenticated
CREATE POLICY "Users can view their own assessments"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
  ON public.assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assessments"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Coaches can view shared assessments for students on their teams"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'coach'::user_role)
    AND (share_reflections = true OR share_reflections IS NULL)
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = assessments.user_id
        AND p.team_id IS NOT NULL
        AND is_coach_for_team(auth.uid(), p.team_id)
    )
  );

-- Fix profiles table policies to explicitly require authentication
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile via trigger" ON public.profiles;
DROP POLICY IF EXISTS "Users can view teammates profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view profiles of students on their teams" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate policies with TO authenticated
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile via trigger"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view teammates profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (are_teammates(auth.uid(), id));

CREATE POLICY "Coaches can view profiles of students on their teams"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'coach'::user_role)
    AND team_id IS NOT NULL
    AND is_coach_for_team(auth.uid(), team_id)
  );

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role));