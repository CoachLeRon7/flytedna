import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, Bell } from "lucide-react";

interface TeammateToAssess {
  user_id: string;
  first_name: string;
  last_name: string;
  has_completed_self_assessment: boolean;
}

export const PeerAssessmentPrompt = () => {
  const navigate = useNavigate();
  const [teammates, setTeammates] = useState<TeammateToAssess[]>([]);
  const [loading, setLoading] = useState(true);
  const currentSemester = "Fall 2024"; // TODO: Get from context
  const currentTimepoint = "pre"; // TODO: Get from assessment state

  useEffect(() => {
    const fetchTeammates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_teammates_for_peer_assessment", {
          _timepoint: currentTimepoint,
          _semester_label: currentSemester,
        });

        if (error) throw error;
        setTeammates(data || []);
      } catch (error) {
        console.error("Error fetching teammates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeammates();
  }, [currentTimepoint, currentSemester]);

  if (loading || teammates.length === 0) {
    return null;
  }

  return (
    <Card className="border-[hsl(var(--student-accent))] border-2 shadow-elegant bg-gradient-to-br from-background to-[hsl(var(--student-accent))]/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--student-accent))]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[hsl(var(--student-accent))]" />
            </div>
            Peer Assessments Available
            <Badge className="bg-[hsl(var(--student-accent))] text-white animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          </CardTitle>
        </div>
        <CardDescription className="text-base mt-2">
          🤝 Help your teammates grow by providing anonymous feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-[hsl(var(--student-accent))]/10 border-[hsl(var(--student-accent))]/30">
          <AlertDescription className="font-medium">
            🔒 Your responses are completely anonymous. Teammates will only see aggregated feedback from 3+ peers.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {teammates.slice(0, 3).map((teammate) => (
            <div
              key={teammate.user_id}
              className="flex items-center justify-between p-4 rounded-lg border-2 hover:border-[hsl(var(--student-accent))] hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {teammate.first_name} {teammate.last_name}
                </span>
                {teammate.has_completed_self_assessment && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
              </div>
              <Button
                size="lg"
                className="bg-[hsl(var(--student-accent))] hover:bg-[hsl(var(--student-accent))]/90"
                onClick={() =>
                  navigate(
                    `/peer/assess?user_id=${teammate.user_id}&timepoint=${currentTimepoint}&semester=${currentSemester}`
                  )
                }
              >
                Assess Teammate
              </Button>
            </div>
          ))}
        </div>

        {teammates.length > 3 && (
          <p className="text-sm text-muted-foreground mt-3">
            +{teammates.length - 3} more teammates available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
