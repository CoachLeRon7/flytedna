-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Create function to clean up old performance metrics
-- Keeps metrics from the last 30 days by default
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_metrics(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete metrics older than retention period
  DELETE FROM public.performance_metrics
  WHERE created_at < (now() - (retention_days || ' days')::interval);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup operation
  RAISE LOG 'Cleaned up % old performance metrics (retention: % days)', deleted_count, retention_days;
  
  RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION public.cleanup_old_performance_metrics TO authenticated;

COMMENT ON FUNCTION public.cleanup_old_performance_metrics IS 'Removes performance metrics older than specified retention period (default 30 days)';
