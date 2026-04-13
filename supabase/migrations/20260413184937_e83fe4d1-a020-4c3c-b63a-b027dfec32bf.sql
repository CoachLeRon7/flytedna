
CREATE TABLE public.module_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_number INTEGER NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('middle', 'high')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  screen_data JSONB,
  UNIQUE (user_id, module_number, track)
);

ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
  ON public.module_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.module_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
  ON public.module_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
