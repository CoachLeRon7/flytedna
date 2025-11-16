-- Remove insecure public update policy
DROP POLICY IF EXISTS "Public can complete via invitation token" ON public.guardian_assessments;

-- Service role (edge functions) can manage guardian assessments
CREATE POLICY "Service role can manage guardian assessments"
ON public.guardian_assessments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update config.toml to disable JWT for the new function
-- This will be added to supabase/config.toml separately
