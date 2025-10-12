-- Fix nudges RLS policies to use has_role() function instead of querying profiles directly
-- This resolves the security issue where policies query the deprecated profiles.role column

-- Drop old policies that query profiles table directly
DROP POLICY IF EXISTS "Coaches and admins can view all nudges" ON public.nudges;
DROP POLICY IF EXISTS "Coaches and admins can manage all nudges" ON public.nudges;

-- Create new secure policies using has_role function
CREATE POLICY "Coaches and admins can view all nudges"
ON public.nudges 
FOR SELECT
USING (
  public.has_role(auth.uid(), 'coach'::user_role) 
  OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Coaches and admins can manage all nudges"
ON public.nudges 
FOR ALL
USING (
  public.has_role(auth.uid(), 'coach'::user_role) 
  OR public.has_role(auth.uid(), 'admin'::user_role)
);