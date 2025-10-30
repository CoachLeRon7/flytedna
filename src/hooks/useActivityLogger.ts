import { supabase } from "@/integrations/supabase/client";

export type ActivityType = 
  | 'login'
  | 'assessment_completed'
  | 'peer_assessment_completed'
  | 'coach_assessment_completed'
  | 'growth_plan_updated'
  | 'profile_updated'
  | 'team_changed';

export const useActivityLogger = () => {
  const logActivity = async (
    activityType: ActivityType,
    activityDetails?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_details: activityDetails || {}
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};
