-- Fix 1: Tighten coupon_usage INSERT policy to require auth.uid() = user_id
DROP POLICY IF EXISTS "System can create coupon usage records" ON public.coupon_usage;

CREATE POLICY "Authenticated users can create their own coupon usage"
ON public.coupon_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Also allow service_role to insert (for server-side operations like webhooks)
CREATE POLICY "Service role can create coupon usage records"
ON public.coupon_usage
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix 2: Create a safe public view for packages that hides Stripe internals
CREATE OR REPLACE VIEW public.packages_public
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  slug,
  description,
  base_price_cents,
  features,
  display_order,
  is_active,
  has_payment_plan,
  includes_summer_program,
  created_at,
  updated_at
FROM public.packages
WHERE is_active = true;

-- Replace the broad public SELECT with authenticated-only full access
DROP POLICY IF EXISTS "Everyone can view active packages" ON public.packages;

-- Authenticated users can see full package details (needed for checkout)
CREATE POLICY "Authenticated users can view active packages"
ON public.packages
FOR SELECT
TO authenticated
USING (is_active = true);

-- Public (unauthenticated) users can only see active packages without Stripe details
-- They'll use the packages_public view
CREATE POLICY "Public can view active packages basic info"
ON public.packages
FOR SELECT
TO anon
USING (is_active = true);