import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Assessment {
  composite_mean: number;
  leadership_dna_mean: number;
  excellence_mean: number;
  accountability_mean: number;
  discipline_mean: number;
  belonging_mean: number;
  classification: string;
  timepoint: string;
}

interface LeadershipSnapshotProps {
  latestAssessment: Assessment | null;
  assessmentHistory: Assessment[];
}

export function LeadershipSnapshot({ latestAssessment, assessmentHistory }: LeadershipSnapshotProps) {
  if (!latestAssessment) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💪 Leadership Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Complete an assessment to see your leadership profile</p>
        </CardContent>
      </Card>
    );
  }

  const radarData = [
    { domain: "Leadership DNA", value: latestAssessment.leadership_dna_mean || 0 },
    { domain: "Excellence", value: latestAssessment.excellence_mean || 0 },
    { domain: "Accountability", value: latestAssessment.accountability_mean || 0 },
    { domain: "Discipline", value: latestAssessment.discipline_mean || 0 },
    { domain: "Belonging", value: latestAssessment.belonging_mean || 0 },
  ];

  const trendData = assessmentHistory.map(a => ({
    timepoint: a.timepoint.charAt(0).toUpperCase() + a.timepoint.slice(1),
    composite: a.composite_mean || 0,
  }));

  return (
    <Card className="shadow-card border-l-4 border-l-[hsl(var(--student-accent))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💪 Leadership Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Domain Profile</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar name="Scores" dataKey="value" stroke="hsl(var(--student-accent))" fill="hsl(var(--student-accent))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Composite Trend</h3>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timepoint" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="composite" stroke="hsl(var(--student-accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                Complete more assessments to see trends
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-1">Current Classification</p>
          <p className="text-2xl font-bold text-[hsl(var(--student-accent))]">{latestAssessment.classification}</p>
        </div>
      </CardContent>
    </Card>
  );
}
