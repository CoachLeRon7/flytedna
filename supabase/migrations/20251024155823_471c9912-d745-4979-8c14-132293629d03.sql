-- Create trigger function to notify on assessment completion
CREATE OR REPLACE FUNCTION notify_assessment_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be handled by the edge function
  -- Just log the event
  RAISE LOG 'Assessment completed: %', NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on assessments table
DROP TRIGGER IF EXISTS on_assessment_completed ON assessments;
CREATE TRIGGER on_assessment_completed
  AFTER INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION notify_assessment_completion();