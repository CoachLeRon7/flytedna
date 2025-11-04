import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoachAssessmentConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get("assessmentId");
  
  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState("");
  const [compositeScore, setCompositeScore] = useState<number | null>(null);
  const [classification, setClassification] = useState("");
  const [timepoint, setTimepoint] = useState("");

  useEffect(() => {
    if (!assessmentId) {
      navigate("/coach");
      return;
    }

    const fetchAssessmentResults = async () => {
      try {
        const { data, error } = await supabase
          .from("coach_assessments")
          .select(`
            composite_mean,
            classification,
            timepoint,
            athlete_id
          `)
          .eq("id", assessmentId)
          .single();

        if (error) throw error;

        if (data) {
          setCompositeScore(data.composite_mean);
          setClassification(data.classification);
          setTimepoint(data.timepoint);

          // Fetch athlete name
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", data.athlete_id)
            .single();

          if (profileData) {
            setAthleteName(`${profileData.first_name} ${profileData.last_name}`);
          }
        }
      } catch (error) {
        console.error("Error loading assessment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentResults();
  }, [assessmentId, navigate]);

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case "transformational": return "bg-purple-600";
      case "emerging": return "bg-blue-600";
      case "developing": return "bg-green-600";
      case "foundational": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

  const formatTimepoint = (tp: string) => {
    if (tp === "pre") return "Pre-Season";
    if (tp === "mid") return "Mid-Season";
    if (tp === "end") return "Post-Season";
    return tp;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 max-w-lg w-full">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Assessment Complete</h1>
          <p className="text-muted-foreground">
            Your evaluation has been saved successfully
          </p>
        </div>

        <div className="space-y-6">
          {/* Athlete Info */}
          <div className="text-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Athlete Assessed</p>
            <h2 className="text-2xl font-bold mb-3">{athleteName}</h2>
            <Badge variant="outline" className="text-sm">
              {formatTimepoint(timepoint)}
            </Badge>
          </div>

          {/* Composite Score - Athlete's Score */}
          <div className="text-center p-8 bg-card rounded-lg border-2 border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Athlete's Leadership Score
            </p>
            <div className="text-5xl font-bold text-primary mb-3">
              {compositeScore?.toFixed(2) || "N/A"}
            </div>
            <Badge className={`${getClassificationColor(classification)} text-white`}>
              {classification}
            </Badge>
          </div>

          {/* Clarification Message */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> This score reflects {athleteName}'s leadership development 
              based on your assessment. This is not your personal leadership score.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate("/coach")}
              className="w-full"
              size="lg"
            >
              Return to Coach Dashboard
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              View Full Assessment Details
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
