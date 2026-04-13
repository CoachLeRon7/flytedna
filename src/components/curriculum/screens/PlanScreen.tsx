import { useState, useEffect } from "react";
import { PlanScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { Target } from "lucide-react";

interface Props {
  data: PlanScreenData;
  onComplete: (data: string) => void;
  savedData?: string;
}

const PlanScreen = ({ data, onComplete, savedData }: Props) => {
  const [plan, setPlan] = useState(savedData || "");

  const isFilled = plan.trim().length > 10;

  useEffect(() => {
    if (isFilled) onComplete(plan);
  }, [isFilled, plan, onComplete]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-card">
        <p className="text-sm font-bold text-foreground mb-3">{data.prompt}</p>
        <Textarea
          placeholder={data.placeholder}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>

      {!isFilled && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Write your action plan to complete this module
        </p>
      )}
    </div>
  );
};

export default PlanScreen;
