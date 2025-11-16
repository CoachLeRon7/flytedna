-- Create packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  base_price_cents INTEGER NOT NULL,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  has_payment_plan BOOLEAN DEFAULT false,
  payment_plan_config JSONB,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  includes_summer_program BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id),
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('full_payment', 'payment_plan')),
  total_amount_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER DEFAULT 0,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'refunded', 'expired')),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  membership_start_date DATE,
  membership_end_date DATE,
  refund_eligible_until TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment_plan_installments table
CREATE TABLE IF NOT EXISTS public.payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  due_date DATE NOT NULL,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'overdue')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create package_access table
CREATE TABLE IF NOT EXISTS public.package_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  access_granted_at TIMESTAMPTZ DEFAULT now(),
  access_expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, package_id, purchase_id)
);

-- Create refund_requests table
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'processed')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  stripe_refund_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create summer_program_enrollments table
CREATE TABLE IF NOT EXISTS public.summer_program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.profiles(id),
  parent_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  educational_preferences JSONB DEFAULT '[]'::jsonb,
  educational_struggles JSONB DEFAULT '[]'::jsonb,
  additional_notes TEXT,
  enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'waitlist', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create coaches_inquiries table
CREATE TABLE IF NOT EXISTS public.coaches_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_name TEXT NOT NULL,
  coach_email TEXT NOT NULL,
  phone_number TEXT,
  organization_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  team_size INTEGER NOT NULL,
  program_type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'closed_won', 'closed_lost')),
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_value_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create renewal_reminders table
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('90_day', '30_day', '7_day', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_membership_end_date ON public.purchases(membership_end_date);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_purchase_id ON public.payment_plan_installments(purchase_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_due_date ON public.payment_plan_installments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_plan_installments_status ON public.payment_plan_installments(status);
CREATE INDEX IF NOT EXISTS idx_package_access_user_id ON public.package_access(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_coaches_inquiries_status ON public.coaches_inquiries(status);

-- Enable RLS on all tables
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summer_program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Everyone can view active packages"
  ON public.packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON public.packages FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all purchases"
  ON public.purchases FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for payment_plan_installments
CREATE POLICY "Users can view their own payment plans"
  ON public.payment_plan_installments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = payment_plan_installments.purchase_id
      AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payment plans"
  ON public.payment_plan_installments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for package_access
CREATE POLICY "Users can view their own package access"
  ON public.package_access FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all package access"
  ON public.package_access FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for refund_requests
CREATE POLICY "Users can view their own refund requests"
  ON public.refund_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create refund requests for their purchases"
  ON public.refund_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = refund_requests.purchase_id
      AND purchases.user_id = auth.uid()
      AND purchases.refund_eligible_until > now()
    )
  );

CREATE POLICY "Admins can manage all refund requests"
  ON public.refund_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for summer_program_enrollments
CREATE POLICY "Users can view their own enrollments"
  ON public.summer_program_enrollments FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can manage their own enrollments"
  ON public.summer_program_enrollments FOR ALL
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Admins can manage all enrollments"
  ON public.summer_program_enrollments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for coaches_inquiries (public can insert)
CREATE POLICY "Anyone can submit coach inquiries"
  ON public.coaches_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON public.coaches_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all inquiries"
  ON public.coaches_inquiries FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for renewal_reminders
CREATE POLICY "Users can view their own reminders"
  ON public.renewal_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create reminders"
  ON public.renewal_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all reminders"
  ON public.renewal_reminders FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_plan_installments_updated_at BEFORE UPDATE ON public.payment_plan_installments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_access_updated_at BEFORE UPDATE ON public.package_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refund_requests_updated_at BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_summer_program_enrollments_updated_at BEFORE UPDATE ON public.summer_program_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_inquiries_updated_at BEFORE UPDATE ON public.coaches_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial package data
INSERT INTO public.packages (name, slug, base_price_cents, description, features, has_payment_plan, display_order, includes_summer_program) VALUES
(
  'Essential Package',
  'essential',
  3900,
  'Perfect for getting started with leadership development',
  '["Access to workshop replays", "Monthly leadership resources", "Community forum access", "Digital workbook", "Email support"]'::jsonb,
  false,
  1,
  false
),
(
  'Elevation Package',
  'elevation',
  12900,
  'Take your leadership to the next level',
  '["Everything in Essential", "Quarterly group coaching calls", "Advanced workshop content", "Priority support", "Leadership assessment tools", "Goal tracking dashboard"]'::jsonb,
  false,
  2,
  false
),
(
  'Transformation Package',
  'transformation',
  34900,
  'Complete transformation with personalized support',
  '["Everything in Elevation", "Monthly 1-on-1 coaching", "Personalized development plan", "Summer Leadership Program access", "Custom leadership reports", "24/7 priority support"]'::jsonb,
  true,
  3,
  true
),
(
  'Academy Lab Package',
  'academy-lab',
  99500,
  'Elite program for serious leaders',
  '["Everything in Transformation", "Weekly 1-on-1 coaching", "Executive mentorship", "Custom curriculum design", "Family coaching sessions", "College placement support", "Leadership portfolio development"]'::jsonb,
  true,
  4,
  true
),
(
  'Coaches & Program',
  'coaches',
  0,
  'Custom solutions for coaches and teams',
  '["Team-wide leadership training", "Coach development program", "Custom curriculum", "Ongoing support", "Team analytics", "Program implementation"]'::jsonb,
  false,
  5,
  false
) ON CONFLICT (slug) DO NOTHING;

-- Update payment plan configurations
UPDATE public.packages
SET payment_plan_config = '{
  "down_payment_cents": 12900,
  "installments": [
    {"amount_cents": 11000, "due_days": 30},
    {"amount_cents": 11000, "due_days": 60}
  ]
}'::jsonb
WHERE slug = 'transformation';

UPDATE public.packages
SET payment_plan_config = '{
  "installments": [
    {"amount_cents": 24875, "due_days": 0},
    {"amount_cents": 24875, "due_days": 30},
    {"amount_cents": 24875, "due_days": 60},
    {"amount_cents": 24875, "due_days": 90}
  ]
}'::jsonb
WHERE slug = 'academy-lab';