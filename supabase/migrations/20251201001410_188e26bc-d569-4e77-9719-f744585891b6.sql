-- Revert validate_and_consume_pilot_code to original version without http call
CREATE OR REPLACE FUNCTION public.validate_and_consume_pilot_code(_code text, _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;