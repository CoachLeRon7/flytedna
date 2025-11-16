-- Create performance_metrics table to store edge function execution data
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  total_duration_ms INTEGER NOT NULL,
  checkpoints JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_performance_metrics_operation ON public.performance_metrics(operation);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX idx_performance_metrics_duration ON public.performance_metrics(total_duration_ms DESC);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read performance metrics
CREATE POLICY "Admins can view performance metrics"
  ON public.performance_metrics
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add comment
COMMENT ON TABLE public.performance_metrics IS 'Stores edge function performance metrics for monitoring and analysis';