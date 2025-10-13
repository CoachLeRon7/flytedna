-- Add team color customization fields to teams table
ALTER TABLE public.teams 
ADD COLUMN primary_color TEXT DEFAULT '#1E40AF',
ADD COLUMN secondary_color TEXT DEFAULT '#3B82F6';

-- Add institution name field for high schools/universities
ALTER TABLE public.teams 
ADD COLUMN institution TEXT;

COMMENT ON COLUMN public.teams.primary_color IS 'Primary team color in hex format';
COMMENT ON COLUMN public.teams.secondary_color IS 'Secondary team color in hex format';
COMMENT ON COLUMN public.teams.institution IS 'Name of the high school or university';