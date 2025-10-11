import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface ReviewSectionProps {
  form: UseFormReturn<any>;
}

export const ReviewSection = ({ form }: ReviewSectionProps) => {
  const values = form.getValues();
  
  const domainCounts = {
    "Leadership DNA": [values.L1, values.L2, values.L3, values.L4, values.L5, values.L6].filter(v => v).length,
    "Excellence": [values.E1, values.E2, values.E3, values.E4, values.E5, values.E6].filter(v => v).length,
    "Accountability": [values.A1, values.A2, values.A3, values.A4, values.A5, values.A6].filter(v => v).length,
    "Discipline": [values.D1, values.D2, values.D3, values.D4, values.D5, values.D6].filter(v => v).length,
    "Belonging": [values.B1, values.B2, values.B3, values.B4, values.B5, values.B6].filter(v => v).length,
  };

  const reflectionCount = Object.values(values.reflections || {}).filter(v => typeof v === 'string' && v.length > 0).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review Your Assessment
        </h2>
        <p className="text-muted-foreground">
          Please review your responses before submitting. Make sure all required sections are complete.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Semester:</span>
            <span className="font-medium">{values.semester_label || "Not provided"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timepoint:</span>
            <Badge variant="secondary">{values.timepoint || "Not selected"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domain Completion</CardTitle>
          <CardDescription>30 total questions across 5 leadership domains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(domainCounts).map(([domain, count]) => (
            <div key={domain} className="flex items-center justify-between">
              <span className="text-muted-foreground">{domain}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{count}/6</span>
                {count === 6 && <CheckCircle2 className="h-5 w-5 text-success" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reflections</CardTitle>
          <CardDescription>Optional deep-dive questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Completed reflections</span>
            <span className="text-sm font-medium">{reflectionCount}/4</span>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Ready to Submit?</h3>
        <p className="text-sm text-muted-foreground">
          Once you submit, your assessment will be scored automatically. You'll see your results 
          across all five domains and receive personalized coaching insights based on your responses.
        </p>
      </div>
    </div>
  );
};
