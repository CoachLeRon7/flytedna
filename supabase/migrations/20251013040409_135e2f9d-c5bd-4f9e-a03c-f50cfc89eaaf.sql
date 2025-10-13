-- Allow admins to update profiles (for team assignments)
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Allow coaches to update profiles for their team members (for team assignments)
CREATE POLICY "Coaches can update their team members profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'coach') 
    AND team_id IS NOT NULL 
    AND is_coach_for_team(auth.uid(), team_id)
  );