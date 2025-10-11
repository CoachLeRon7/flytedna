import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessment_id");
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assessmentId) {
      navigate("/dashboard");
      return;
    }

    const fetchAssessment = async () => {
      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) throw error;
        setAssessment(data);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Transformational":
        return "bg-success text-success-foreground";
      case "Emerging":
        return "bg-primary text-primary-foreground";
      case "Developing":
        return "bg-accent text-accent-foreground";
      case "Foundational":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const domains = [
    { name: "Leadership DNA", mean: assessment.leadership_dna_mean },
    { name: "Excellence", mean: assessment.excellence_mean },
    { name: "Accountability", mean: assessment.accountability_mean },
    { name: "Discipline", mean: assessment.discipline_mean },
    { name: "Belonging", mean: assessment.belonging_mean },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={logo} alt="FLY.TE Academy" className="h-12 w-auto" />
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Your FLDI Results</h1>
          <Badge className={getClassificationColor(assessment.classification)}>
            {assessment.classification || "Processing..."}
          </Badge>
          <p className="text-muted-foreground mt-4">
            {assessment.semester_label} - {assessment.timepoint} Assessment
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Composite Score</CardTitle>
            <CardDescription>Overall leadership development score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                {assessment.composite_mean?.toFixed(2) || "N/A"}
              </div>
              <div className="flex-1">
                <Progress value={(assessment.composite_mean || 0) * 20} className="h-3" />
              </div>
              <span className="text-sm text-muted-foreground">out of 5.0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Domain Scores</CardTitle>
            <CardDescription>Performance across the five leadership domains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {domains.map((domain) => (
              <div key={domain.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{domain.name}</span>
                  <span className="text-primary font-semibold">
                    {domain.mean?.toFixed(2) || "N/A"}
                  </span>
                </div>
                <Progress value={(domain.mean || 0) * 20} />
              </div>
            ))}
          </CardContent>
        </Card>

        {assessment.coaching_insights && assessment.coaching_insights.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Coaching Insights
              </CardTitle>
              <CardDescription>Personalized recommendations for growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.coaching_insights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 bg-background"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-foreground">{insight.domain}</span>
                    <Badge variant={insight.level === "critical" ? "destructive" : "secondary"}>
                      {insight.level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{insight.message}</p>
                  <p className="text-sm text-foreground">
                    <strong>Action:</strong> {insight.action}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate("/assessment")}>
            Take Another Assessment
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
