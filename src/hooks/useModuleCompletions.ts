import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useModuleCompletions(track: "middle" | "high") {
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("module_completions")
        .select("module_number")
        .eq("user_id", userData.user.id)
        .eq("track", track);

      if (data) {
        setCompletedModules(new Set(data.map((r) => r.module_number)));
      }
      setLoading(false);
    };

    fetch();
  }, [track]);

  return { completedModules, loading };
}
