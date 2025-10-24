-- Fix search_path for notify_assessment_completion function
CREATE OR REPLACE FUNCTION notify_assessment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the edge function
  -- Just log the event
  RAISE LOG 'Assessment completed: %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;