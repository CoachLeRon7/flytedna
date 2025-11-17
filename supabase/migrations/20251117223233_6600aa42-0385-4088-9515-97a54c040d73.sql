-- Fix search path for generate_pilot_code function
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
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public;