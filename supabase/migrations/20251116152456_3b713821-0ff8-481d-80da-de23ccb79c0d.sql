-- Drop the profiles_secure view as it's no longer needed
-- The view was used to mask emails, but:
-- 1. It's only used once in CoachDashboard
-- 2. The query can be optimized to filter server-side by team
-- 3. Email masking is already handled by the mask_email() function in profiles table RLS
-- 4. Direct queries to profiles table are more efficient and clearer

DROP VIEW IF EXISTS public.profiles_secure;