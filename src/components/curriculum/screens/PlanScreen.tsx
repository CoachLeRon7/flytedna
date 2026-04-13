import { useState, useEffect, useCallback } from "react";
import { PlanScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { Target, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  data: PlanScreenData;
  onComplete: (data: string) => void;
  savedData?: string;
}

const PlanScreen = ({ data, onComplete, savedData }: Props) => {
  const [plan, setPlan] = useState(savedData || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const isFilled = plan.trim().length > 10;

  useEffect(() => {
    if (isFilled) onComplete(plan);
  }, [isFilled, plan, onComplete]);

  const fetchSuggestions = useCallback(async () => {
    if (hasFetched) return;
    setLoading(true);
    setHasFetched(true);

    try {
      // Try to get the logged-in user's latest assessment scores
      let scores = null;
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { data: assessment } = await supabase
          .from("assessments")
          .select(
            "leadership_dna_mean, accountability_mean, excellence_mean, discipline_mean, belonging_mean"
          )
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (assessment) scores = assessment;
      }

      const { data: result, error } = await supabase.functions.invoke(
        "suggest-behaviors",
        {
          body: {
            scores,
            moduleContext: data.title,
          },
        }
      );

      if (error) throw error;
      if (result?.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (e) {
      console.error("Failed to fetch AI suggestions:", e);
      // Show fallback suggestions
      setSuggestions([
        "Show up 5 minutes early to every practice",
        "Encourage a teammate who made a mistake",
        "Ask your coach for one piece of feedback after practice",
        "Write down your top goal before each game",
        "Hold yourself accountable before pointing at others",
      ]);
      toast.error("Could not load personalized suggestions");
    } finally {
      setLoading(false);
    }
  }, [hasFetched, data.title]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const selectSuggestion = (suggestion: string) => {
    setPlan(suggestion);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">
            AI-Suggested Behaviors Based on Your FLDI Score
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">
              Analyzing your leadership profile...
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                  plan === s
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <span className="font-semibold text-xs mr-2 opacity-60">
                  {i + 1}.
                </span>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual entry */}
      <div className="bg-card border rounded-xl p-5 shadow-card">
        <p className="text-sm font-bold text-foreground mb-3">{data.prompt}</p>
        <Textarea
          placeholder={data.placeholder}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Select a suggestion above or write your own
        </p>
      </div>

      {!isFilled && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Choose a behavior or write your action plan to continue
        </p>
      )}
    </div>
  );
};

export default PlanScreen;
