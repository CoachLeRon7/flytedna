-- Create table to track announcement rate limits
CREATE TABLE IF NOT EXISTS public.announcement_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcement_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow admins to view their own rate limit records
CREATE POLICY "Admins can view their own rate limits"
ON public.announcement_rate_limits
FOR SELECT
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'));

-- Allow system to insert rate limit records
CREATE POLICY "System can track rate limits"
ON public.announcement_rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX idx_announcement_rate_limits_user_time 
ON public.announcement_rate_limits(user_id, created_at DESC);

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_announcement_rate_limit(_user_id UUID, _max_per_hour INTEGER DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Count announcements in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.announcement_rate_limits
  WHERE user_id = _user_id
    AND created_at > (now() - interval '1 hour');
  
  IF recent_count >= _max_per_hour THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'count', recent_count,
      'limit', _max_per_hour,
      'message', format('Rate limit exceeded. Maximum %s announcements per hour. You have sent %s.', _max_per_hour, recent_count)
    );
  ELSE
    RETURN jsonb_build_object(
      'allowed', true,
      'count', recent_count,
      'limit', _max_per_hour,
      'remaining', _max_per_hour - recent_count
    );
  END IF;
END;
$$;

-- Create function to record announcement send
CREATE OR REPLACE FUNCTION public.record_announcement_send(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.announcement_rate_limits (user_id)
  VALUES (_user_id);
  
  -- Clean up old records (older than 24 hours) to prevent table bloat
  DELETE FROM public.announcement_rate_limits
  WHERE created_at < (now() - interval '24 hours');
END;
$$;

-- Add comment explaining the table
COMMENT ON TABLE public.announcement_rate_limits IS 'Tracks announcement sends for rate limiting. Records are cleaned up after 24 hours.';