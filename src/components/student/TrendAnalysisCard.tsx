import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface AssessmentComparison {
  timepoint: string;
  composite: number;
  leadership_dna: number;
  excellence: number;
  accountability: number;
  discipline: number;
  belonging: number;
  classification: string;
}

interface TrendAnalysisCardProps {
  current: AssessmentComparison;
  previous?: AssessmentComparison;
}

export function TrendAnalysisCard({ current, previous }: TrendAnalysisCardProps) {
  if (!previous) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>Complete your mid-semester assessment to see your growth</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const calculateChange = (currentVal: number, previousVal: number) => {
    return currentVal - previousVal;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0.2) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < -0.2) return <TrendingDown className="h-4 w-4 text-orange-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0.2) return "text-green-600 dark:text-green-400";
    if (change < -0.2) return "text-orange-600 dark:text-orange-400";
    return "text-muted-foreground";
  };

  const domains = [
    { key: 'composite', label: 'Overall Composite' },
    { key: 'leadership_dna', label: 'Leadership DNA' },
    { key: 'excellence', label: 'Excellence' },
    { key: 'accountability', label: 'Accountability' },
    { key: 'discipline', label: 'Discipline' },
    { key: 'belonging', label: 'Belonging' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trajectory</CardTitle>
        <CardDescription>
          Comparing {previous.timepoint} to {current.timepoint}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map(({ key, label }) => {
            const change = calculateChange(
              current[key as keyof AssessmentComparison] as number,
              previous[key as keyof AssessmentComparison] as number
            );

            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium min-w-[140px]">{label}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(change)}
                    <span className={`text-sm font-semibold ${getTrendColor(change)}`}>
                      {change > 0 ? '+' : ''}{change.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{previous.timepoint}</div>
                    <div className="text-sm font-medium">
                      {(previous[key as keyof AssessmentComparison] as number).toFixed(2)}
                    </div>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{current.timepoint}</div>
                    <div className="text-sm font-bold">
                      {(current[key as keyof AssessmentComparison] as number).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Classification Change */}
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leadership Classification</span>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{previous.classification}</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge>{current.classification}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
