-- Create pilot invitations table
CREATE TABLE pilot_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 months'),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pilot_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage pilot invitations
CREATE POLICY "Admins can manage pilot invitations"
  ON pilot_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Anyone can read active codes for validation during signup
CREATE POLICY "Anyone can validate pilot codes"
  ON pilot_invitations FOR SELECT
  USING (is_active = true AND expires_at > NOW());

-- Index for fast lookups
CREATE INDEX idx_pilot_invitations_code ON pilot_invitations(invitation_code);

-- Insert hidden pilot package
INSERT INTO packages (
  name,
  slug,
  description,
  base_price_cents,
  features,
  has_payment_plan,
  is_active,
  display_order,
  stripe_product_id,
  stripe_price_id
) VALUES (
  'Pilot Program',
  'pilot-program',
  '90-day pilot access to the complete FLDI platform. Invitation only.',
  0,
  '["Full platform access", "90-day trial period", "View historical data after expiration", "Upgrade anytime"]'::jsonb,
  false,
  true,
  -1,
  NULL,
  NULL
);

-- Add pilot tracking to profiles
ALTER TABLE profiles ADD COLUMN pilot_code_used TEXT;
ALTER TABLE profiles ADD COLUMN pilot_started_at TIMESTAMP WITH TIME ZONE;

-- Index for analytics
CREATE INDEX idx_profiles_pilot_code ON profiles(pilot_code_used) WHERE pilot_code_used IS NOT NULL;

-- Add conversion tracking to purchases
ALTER TABLE purchases ADD COLUMN converted_from_pilot BOOLEAN DEFAULT false;

-- Function to generate formatted pilot codes
CREATE OR REPLACE FUNCTION generate_pilot_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'PILOT-' || 
            upper(substring(md5(random()::text) from 1 for 3)) || '-' ||
            upper(substring(md5(random()::text) from 1 for 3));
    
    SELECT EXISTS(
      SELECT 1 FROM pilot_invitations WHERE invitation_code = code
    ) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to validate and consume pilot code
CREATE OR REPLACE FUNCTION validate_and_consume_pilot_code(
  _code TEXT,
  _user_id UUID
) RETURNS JSONB AS $$
DECLARE
  invitation_record RECORD;
  pilot_package_id UUID;
  new_purchase_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = _user_id AND pilot_code_used IS NOT NULL
  ) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'You have already used a pilot code'
    );
  END IF;

  SELECT * INTO invitation_record
  FROM pilot_invitations
  WHERE invitation_code = _code
    AND is_active = true
    AND expires_at > NOW()
    AND (max_uses IS NULL OR current_uses < max_uses)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Invalid or expired pilot code'
    );
  END IF;

  SELECT id INTO pilot_package_id
  FROM packages
  WHERE slug = 'pilot-program'
  LIMIT 1;

  IF pilot_package_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Pilot program not configured'
    );
  END IF;

  UPDATE pilot_invitations
  SET current_uses = current_uses + 1
  WHERE id = invitation_record.id;

  INSERT INTO purchases (
    user_id,
    package_id,
    total_amount_cents,
    amount_paid_cents,
    purchase_type,
    status,
    purchased_at,
    membership_start_date,
    membership_end_date,
    metadata
  ) VALUES (
    _user_id,
    pilot_package_id,
    0,
    0,
    'full',
    'completed',
    NOW(),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    jsonb_build_object(
      'pilot_code', _code, 
      'invitation_id', invitation_record.id,
      'is_pilot', true
    )
  ) RETURNING id INTO new_purchase_id;

  INSERT INTO package_access (
    user_id,
    package_id,
    purchase_id,
    access_granted_at,
    access_expires_at,
    is_active
  ) VALUES (
    _user_id,
    pilot_package_id,
    new_purchase_id,
    NOW(),
    NOW() + INTERVAL '90 days',
    true
  );

  UPDATE profiles
  SET pilot_code_used = _code,
      pilot_started_at = NOW()
  WHERE id = _user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pilot access granted! You have 90 days of full access.',
    'expires_at', (NOW() + INTERVAL '90 days')::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check active package access
CREATE OR REPLACE FUNCTION has_active_package_access(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM package_access
    WHERE user_id = _user_id
      AND is_active = true
      AND (access_expires_at IS NULL OR access_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function to get user access status
CREATE OR REPLACE FUNCTION get_user_access_status(_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  access_record RECORD;
BEGIN
  SELECT 
    pa.*,
    p.name as package_name,
    p.slug as package_slug,
    pur.metadata as purchase_metadata
  INTO access_record
  FROM package_access pa
  JOIN packages p ON p.id = pa.package_id
  LEFT JOIN purchases pur ON pur.id = pa.purchase_id
  WHERE pa.user_id = _user_id
    AND pa.is_active = true
  ORDER BY pa.access_granted_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'status', 'no_access',
      'message', 'No active package found. Please purchase a membership to continue.'
    );
  END IF;

  IF access_record.access_expires_at IS NOT NULL 
     AND access_record.access_expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'status', 'expired',
      'package_name', access_record.package_name,
      'package_slug', access_record.package_slug,
      'is_pilot', COALESCE((access_record.purchase_metadata->>'is_pilot')::boolean, false),
      'expired_at', access_record.access_expires_at,
      'message', 'Your access has expired. View historical data or upgrade to continue creating assessments.'
    );
  END IF;

  RETURN jsonb_build_object(
    'has_access', true,
    'status', 'active',
    'package_name', access_record.package_name,
    'package_slug', access_record.package_slug,
    'is_pilot', COALESCE((access_record.purchase_metadata->>'is_pilot')::boolean, false),
    'expires_at', access_record.access_expires_at,
    'days_remaining', CASE 
      WHEN access_record.access_expires_at IS NOT NULL 
      THEN EXTRACT(DAY FROM (access_record.access_expires_at - NOW()))::INTEGER
      ELSE NULL
    END,
    'message', 'Active access'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function for admins to extend pilot periods
CREATE OR REPLACE FUNCTION extend_pilot_period(
  _user_id UUID,
  _additional_days INTEGER
) RETURNS JSONB AS $$
DECLARE
  access_record RECORD;
  new_expiration TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only administrators can extend pilot periods'
    );
  END IF;

  SELECT pa.*, pur.metadata
  INTO access_record
  FROM package_access pa
  JOIN purchases pur ON pur.id = pa.purchase_id
  JOIN packages p ON p.id = pa.package_id
  WHERE pa.user_id = _user_id
    AND p.slug = 'pilot-program'
    AND pa.is_active = true
  ORDER BY pa.access_granted_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No pilot access found for this user'
    );
  END IF;

  new_expiration := GREATEST(
    access_record.access_expires_at,
    NOW()
  ) + (_additional_days || ' days')::INTERVAL;

  UPDATE package_access
  SET access_expires_at = new_expiration
  WHERE id = access_record.id;

  UPDATE purchases
  SET membership_end_date = new_expiration::DATE,
      metadata = COALESCE(metadata, '{}'::jsonb) || 
        jsonb_build_object(
          'extended', true,
          'extended_by', auth.uid(),
          'extended_at', NOW(),
          'additional_days', _additional_days
        )
  WHERE id = access_record.purchase_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', format('Pilot period extended by %s days', _additional_days),
    'new_expiration', new_expiration
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;