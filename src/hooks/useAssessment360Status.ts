import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentTimepoint } from "@/lib/utils";

export interface Assessment360Status {
  selfCompleted: boolean;
  selfCompletedDate?: string;
  peerCount: number;
  peerMinimumMet: boolean;
  guardianCount: number;
  guardianMinimumMet: boolean;
  coachCompleted: boolean;
  coachCompletedDate?: string;
  useGuardianModel: boolean;
  registrationType: 'team' | 'individual' | null;
  userAge: number | null;
  timepoint: AssessmentTimepoint;
  semesterLabel: string;
}

export const useAssessment360Status = (userId: string | undefined, timepoint: AssessmentTimepoint, semesterLabel: string) => {
  const [status, setStatus] = useState<Assessment360Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !timepoint || !semesterLabel) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      setLoading(true);
      
      try {
        // Get user profile with age and registration type
        const { data: profile } = await supabase
          .from('profiles')
          .select('date_of_birth, registration_type')
          .eq('id', userId)
          .single();

        const userAge = profile?.date_of_birth 
          ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        const registrationType = (profile?.registration_type as 'team' | 'individual') || 'team';
        const useGuardianModel = registrationType === 'individual' && userAge !== null && userAge <= 19;

        // Check self-assessment
        const { data: selfAssessment } = await supabase
          .from("assessments")
          .select("created_at")
          .eq("user_id", userId)
          .eq("timepoint", timepoint)
          .eq("semester_label", semesterLabel)
          .maybeSingle();

        // Count peer or guardian assessments based on model
        let peerCount = 0;
        let guardianCount = 0;

        if (useGuardianModel) {
          const { count } = await supabase
            .from('guardian_assessments')
            .select('*', { count: 'exact', head: true })
            .eq('athlete_id', userId)
            .eq('timepoint', timepoint)
            .eq('semester_label', semesterLabel)
            .not('completed_at', 'is', null);
          guardianCount = count || 0;
        } else {
          const { count } = await supabase
            .from("peer_assessments")
            .select("*", { count: "exact", head: true })
            .eq("assessed_user_id", userId)
            .eq("timepoint", timepoint)
            .eq("semester_label", semesterLabel);
          peerCount = count || 0;
        }

        // Check coach assessment
        const { data: coachAssessment } = await supabase
          .from("coach_assessments")
          .select("created_at")
          .eq("athlete_id", userId)
          .eq("timepoint", timepoint)
          .eq("semester_label", semesterLabel)
          .maybeSingle();

        setStatus({
          selfCompleted: !!selfAssessment,
          selfCompletedDate: selfAssessment?.created_at,
          peerCount,
          peerMinimumMet: peerCount >= 3,
          guardianCount,
          guardianMinimumMet: guardianCount >= 1,
          coachCompleted: !!coachAssessment,
          coachCompletedDate: coachAssessment?.created_at,
          useGuardianModel,
          registrationType,
          userAge,
          timepoint,
          semesterLabel,
        });
      } catch (error) {
        console.error("Error fetching 360 status:", error);
      }
      
      setLoading(false);
    };

    fetchStatus();
  }, [userId, timepoint, semesterLabel]);

  return { status, loading };
};
