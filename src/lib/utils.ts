import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AssessmentTimepoint = "pre" | "mid" | "end";

export interface CompletedTimepointInfo {
  timepoint: AssessmentTimepoint;
  created_at: string;
}

export const getStudentCompletedTimepoints = async (
  userId: string,
  semester: string
): Promise<CompletedTimepointInfo[]> => {
  const { data, error } = await supabase
    .from('assessments')
    .select('timepoint, created_at')
    .eq('user_id', userId)
    .eq('semester_label', semester)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching completed timepoints:', error);
    return [];
  }
  
  return data || [];
};

export const getNextSuggestedTimepoint = (
  completedTimepoints: AssessmentTimepoint[]
): AssessmentTimepoint => {
  const order: AssessmentTimepoint[] = ['pre', 'mid', 'end'];
  
  for (const tp of order) {
    if (!completedTimepoints.includes(tp)) {
      return tp;
    }
  }
  
  return 'end'; // All completed, default to end
};

export const formatTimepointDisplay = (timepoint: AssessmentTimepoint): string => {
  const map = {
    pre: 'Pre-Season',
    mid: 'Mid-Season',
    end: 'Post-Season'
  };
  return map[timepoint];
};
