-- Drop the overly broad authentication policies that allow any authenticated user 
-- to view all data. The existing specific role-based policies provide proper access control.

-- Remove broad policy from profiles table
DROP POLICY IF EXISTS "Require authentication for profiles" ON public.profiles;

-- Remove broad policy from assessments table  
DROP POLICY IF EXISTS "Require authentication for assessments" ON public.assessments;

-- The existing specific policies remain in place:
-- For profiles: Users can view their own profile, teammates' profiles, coaches can view 
--   their team members, and admins can view all
-- For assessments: Users can view their own assessments, coaches can view their team's 
--   assessments, and admins can view all