import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentTimepoint } from "@/lib/utils";

export interface Assessment360Status {
  selfCompleted: boolean;
  selfCompletedDate?: string;
  peerCount: number;
  peerMinimumMet: boolean;
  coachCompleted: boolean;
  coachCompletedDate?: string;
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
      
      // Check self-assessment
      const { data: selfAssessment } = await supabase
        .from("assessments")
        .select("created_at")
        .eq("user_id", userId)
        .eq("timepoint", timepoint)
        .eq("semester_label", semesterLabel)
        .maybeSingle();

      // Count peer assessments
      const { count: peerCount } = await supabase
        .from("peer_assessments")
        .select("*", { count: "exact", head: true })
        .eq("assessed_user_id", userId)
        .eq("timepoint", timepoint)
        .eq("semester_label", semesterLabel);

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
        peerCount: peerCount || 0,
        peerMinimumMet: (peerCount || 0) >= 3,
        coachCompleted: !!coachAssessment,
        coachCompletedDate: coachAssessment?.created_at,
        timepoint,
        semesterLabel,
      });
      
      setLoading(false);
    };

    fetchStatus();
  }, [userId, timepoint, semesterLabel]);

  return { status, loading };
};
