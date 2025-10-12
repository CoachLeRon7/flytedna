-- Comprehensive fix for team-based access control and student privacy
-- This fixes three security issues:
-- 1. Profiles table allowing all authenticated users to view all profiles
-- 2. Assessments table allowing coaches to view all student assessments
-- 3. Growth plans table allowing coaches to view all student growth plans

-- Step 1: Create helper function to check if user is a coach for a specific team
CREATE OR REPLACE FUNCTION public.is_coach_for_team(_coach_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teams
    WHERE id = _team_id
      AND _coach_id = ANY(coach_ids)
  )
$$;

-- Step 2: Create helper function to check if two users are on the same team
CREATE OR REPLACE FUNCTION public.are_teammates(_user_id1 UUID, _user_id2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p1
    JOIN public.profiles p2 ON p1.team_id = p2.team_id
    WHERE p1.id = _user_id1
      AND p2.id = _user_id2
      AND p1.team_id IS NOT NULL
  )
$$;

-- Step 3: Fix PROFILES table policies
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users must be authenticated to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches and admins can view all profiles" ON public.profiles;

-- Create new restrictive policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view teammates profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND are_teammates(auth.uid(), id)
);

CREATE POLICY "Coaches can view profiles of students on their teams"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'coach')
  AND team_id IS NOT NULL
  AND is_coach_for_team(auth.uid(), team_id)
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'admin')
);

-- Step 4: Fix ASSESSMENTS table policies
-- Drop existing coach/admin policy and recreate with team-based restrictions
DROP POLICY IF EXISTS "Coaches and admins can view all assessments" ON public.assessments;

CREATE POLICY "Coaches can view assessments for students on their teams"
ON public.assessments
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'coach')
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  )
);

CREATE POLICY "Admins can view all assessments"
ON public.assessments
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'admin')
);

-- Step 5: Fix GROWTH_PLANS table policies
-- Drop existing coach/admin policy and recreate with team-based restrictions
DROP POLICY IF EXISTS "Coaches and admins can view all growth plans" ON public.growth_plans;

CREATE POLICY "Coaches can view growth plans for students on their teams"
ON public.growth_plans
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'coach')
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id
      AND p.team_id IS NOT NULL
      AND is_coach_for_team(auth.uid(), p.team_id)
  )
);

CREATE POLICY "Admins can view all growth plans"
ON public.growth_plans
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND has_role(auth.uid(), 'admin')
);