-- Add expiration to guardian assessment invitations (30-day default)
ALTER TABLE guardian_assessments
  ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days');

-- Update existing records to have expiration dates (30 days from when they were sent)
UPDATE guardian_assessments
SET expires_at = invitation_sent_at + INTERVAL '30 days'
WHERE expires_at IS NULL;