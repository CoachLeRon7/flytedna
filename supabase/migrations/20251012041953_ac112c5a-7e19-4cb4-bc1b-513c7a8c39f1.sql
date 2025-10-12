-- Drop the overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view teams" 
ON public.teams 
FOR SELECT 
USING (auth.uid() IS NOT NULL);