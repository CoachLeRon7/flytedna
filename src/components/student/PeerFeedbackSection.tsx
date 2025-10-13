import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PeerFeedback {
  response_count: number;
  avg_leadership_dna: number;
  avg_excellence: number;
  avg_accountability: number;
  avg_discipline: number;
  avg_belonging: number;
  avg_composite: number;
  comments: string[];
}

interface PeerFeedbackSectionProps {
  userId: string;
  timepoint: "pre" | "mid" | "end";
  semesterLabel: string;
  selfScores?: {
    leadership_dna_mean: number;
    excellence_mean: number;
    accountability_mean: number;
    discipline_mean: number;
    belonging_mean: number;
    composite_mean: number;
  };
}

export const PeerFeedbackSection = ({ userId, timepoint, semesterLabel, selfScores }: PeerFeedbackSectionProps) => {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<PeerFeedback | null>(null);

  useEffect(() => {
    const fetchPeerFeedback = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("peer_feedback_aggregated")
          .select("*")
          .eq("assessed_user_id", userId)
          .eq("timepoint", timepoint)
          .eq("semester_label", semesterLabel)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching peer feedback:", error);
        } else if (data) {
          setFeedback(data as unknown as PeerFeedback);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPeerFeedback();
  }, [userId, timepoint, semesterLabel]);

  const getComparisonIcon = (peerScore: number, selfScore?: number) => {
    if (!selfScore) return <Minus className="h-4 w-4" />;
    const diff = peerScore - selfScore;
    if (diff > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < -0.2) return <TrendingDown className="h-4 w-4 text-orange-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTierBadge = (composite: number) => {
    if (composite >= 4.6) return <Badge className="bg-green-500">Transformational Teammate</Badge>;
    if (composite >= 3.9) return <Badge className="bg-blue-500">Emerging Teammate Leader</Badge>;
    if (composite >= 3.0) return <Badge className="bg-yellow-500">Developing Teammate</Badge>;
    if (composite >= 2.5) return <Badge className="bg-orange-500">Foundational Teammate</Badge>;
    return <Badge variant="secondary">Observation Tier</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Peer Feedback</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Peer Feedback</CardTitle>
          <CardDescription>Anonymous teammate evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Peer feedback will be available once at least 3 teammates have completed their anonymous evaluations of you.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const domains = [
    { name: "Leadership DNA", peer: feedback.avg_leadership_dna, self: selfScores?.leadership_dna_mean },
    { name: "Excellence", peer: feedback.avg_excellence, self: selfScores?.excellence_mean },
    { name: "Accountability", peer: feedback.avg_accountability, self: selfScores?.accountability_mean },
    { name: "Discipline", peer: feedback.avg_discipline, self: selfScores?.discipline_mean },
    { name: "Belonging", peer: feedback.avg_belonging, self: selfScores?.belonging_mean },
  ];

  const topStrengths = domains.sort((a, b) => b.peer - a.peer).slice(0, 3);
  const growthOpportunity = domains.sort((a, b) => a.peer - b.peer)[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Peer Feedback</CardTitle>
            <CardDescription>
              Based on {feedback.response_count} anonymous teammate evaluations
            </CardDescription>
          </div>
          {getTierBadge(feedback.avg_composite)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Peer Composite Score</span>
            <span className="text-2xl font-bold">{feedback.avg_composite.toFixed(2)}</span>
          </div>
          <Progress value={feedback.avg_composite * 20} className="h-2" />
        </div>

        <div>
          <h4 className="font-semibold mb-3">Top 3 Strengths</h4>
          <div className="space-y-2">
            {topStrengths.map((domain, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span>{domain.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{domain.peer.toFixed(2)}</span>
                  {getComparisonIcon(domain.peer, domain.self)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Growth Opportunity</h4>
          <div className="p-3 rounded border border-orange-200 bg-orange-50 dark:bg-orange-950">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{growthOpportunity.name}</span>
              <span className="font-semibold">{growthOpportunity.peer.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This domain has the most room for growth based on peer observations.
            </p>
          </div>
        </div>

        {feedback.comments && feedback.comments.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Anonymous Comments</h4>
            <div className="space-y-2">
              {feedback.comments.map((comment, idx) => (
                <div key={idx} className="p-3 rounded bg-muted/50 text-sm italic">
                  "{comment}"
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
