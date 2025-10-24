import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lightbulb, Target, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface DomainExplanation {
  domain: string;
  label: string;
  score: number;
  description: string;
  sampleQuestions: string[];
  interpretation: string;
  coachingTips: string[];
  riskFlag?: boolean;
}

interface DomainExplanationCardProps {
  explanation: DomainExplanation;
  showCoachingTips?: boolean;
}

export function DomainExplanationCard({ explanation, showCoachingTips = false }: DomainExplanationCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600 dark:text-green-400";
    if (score >= 3.8) return "text-blue-600 dark:text-blue-400";
    if (score >= 3.0) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={explanation.riskFlag ? "border-orange-300 dark:border-orange-700" : ""}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{explanation.label}</CardTitle>
                  {explanation.riskFlag && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Risk Area
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">{explanation.description}</CardDescription>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-2xl font-bold ${getScoreColor(explanation.score)}`}>
                  {explanation.score.toFixed(2)}
                </span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Sample Questions */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Sample Assessment Questions
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                {explanation.sampleQuestions.map((q, idx) => (
                  <li key={idx} className="list-disc">{q}</li>
                ))}
              </ul>
            </div>

            {/* Interpretation */}
            <div>
              <h4 className="font-semibold text-sm mb-2">What This Score Means</h4>
              <p className="text-sm text-muted-foreground">{explanation.interpretation}</p>
            </div>

            {/* Coaching Tips (only for coaches/admins) */}
            {showCoachingTips && explanation.coachingTips.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Lightbulb className="h-4 w-4" />
                  Coaching Recommendations
                </h4>
                <ul className="text-sm space-y-1 ml-6 text-blue-800 dark:text-blue-200">
                  {explanation.coachingTips.map((tip, idx) => (
                    <li key={idx} className="list-disc">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
