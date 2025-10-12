-- Add base authentication requirement for profiles table
-- This blocks all anonymous access and requires users to be logged in
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);

-- Add base authentication requirement for assessments table
-- This blocks anonymous access to private notes and risk flags
CREATE POLICY "Require authentication for assessments"
ON public.assessments
FOR SELECT
TO public
USING (auth.uid() IS NOT NULL);