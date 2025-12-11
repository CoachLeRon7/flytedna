-- Fix 1: Remove public SELECT policy on coupon_codes
-- Users should validate coupons through the validate-coupon edge function, not direct DB access
DROP POLICY IF EXISTS "Anyone can view active coupons for validation" ON public.coupon_codes;

-- Fix 2: Remove public SELECT policy on pilot_invitations  
-- Users should validate pilot codes through RPC function, not direct DB access
DROP POLICY IF EXISTS "Anyone can validate pilot codes" ON public.pilot_invitations;

-- Fix 3: Ensure coaches_inquiries has no public SELECT (verify only admin access)
-- The existing policies look correct but let's ensure there's no lingering public read access
-- Re-create the admin-only SELECT policy with explicit restriction
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.coaches_inquiries;
CREATE POLICY "Only admins can view inquiries" 
ON public.coaches_inquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Fix 4: Add RLS protection to guardian_feedback_aggregated view
-- Views need security_invoker = true to respect RLS
-- First check if view exists and recreate with security_invoker
DROP VIEW IF EXISTS public.guardian_feedback_aggregated;
CREATE VIEW public.guardian_feedback_aggregated WITH (security_invoker = true) AS
SELECT 
  ga.athlete_id,
  ga.semester_label,
  ga.timepoint,
  COUNT(*)::integer as response_count,
  AVG(ga.leadership_dna_mean)::numeric as avg_leadership_dna,
  AVG(ga.excellence_mean)::numeric as avg_excellence,
  AVG(ga.accountability_mean)::numeric as avg_accountability,
  AVG(ga.discipline_mean)::numeric as avg_discipline,
  AVG(ga.belonging_mean)::numeric as avg_belonging,
  AVG(ga.composite_mean)::numeric as avg_composite,
  ARRAY_AGG(ga.optional_comment) FILTER (WHERE ga.optional_comment IS NOT NULL AND ga.optional_comment != '') as comments
FROM public.guardian_assessments ga
WHERE ga.completed_at IS NOT NULL
GROUP BY ga.athlete_id, ga.semester_label, ga.timepoint;

-- Fix 5: Add RLS protection to peer_feedback_aggregated view
DROP VIEW IF EXISTS public.peer_feedback_aggregated;
CREATE VIEW public.peer_feedback_aggregated WITH (security_invoker = true) AS
SELECT 
  pa.assessed_user_id,
  pa.semester_label,
  pa.timepoint,
  COUNT(*)::integer as response_count,
  AVG(pa.leadership_dna_mean)::numeric as avg_leadership_dna,
  AVG(pa.excellence_mean)::numeric as avg_excellence,
  AVG(pa.accountability_mean)::numeric as avg_accountability,
  AVG(pa.discipline_mean)::numeric as avg_discipline,
  AVG(pa.belonging_mean)::numeric as avg_belonging,
  AVG(pa.composite_mean)::numeric as avg_composite,
  ARRAY_AGG(pa.optional_comment) FILTER (WHERE pa.optional_comment IS NOT NULL AND pa.optional_comment != '') as comments
FROM public.peer_assessments pa
GROUP BY pa.assessed_user_id, pa.semester_label, pa.timepoint;

-- Grant SELECT on views to authenticated users (RLS will control actual access via underlying tables)
GRANT SELECT ON public.guardian_feedback_aggregated TO authenticated;
GRANT SELECT ON public.peer_feedback_aggregated TO authenticated;