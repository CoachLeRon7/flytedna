-- Fix public exposure of user personal information in profiles table
-- Drop existing SELECT policies and recreate with explicit authentication checks

DROP POLICY IF EXISTS "Coaches and admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new SELECT policies with explicit authentication requirement
CREATE POLICY "Users must be authenticated to view profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Coaches and admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND get_user_role(auth.uid()) = ANY (ARRAY['coach'::user_role, 'admin'::user_role])
);