import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, CheckCircle } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Peer Assessments Available
        </CardTitle>
        <CardDescription>
          Help your teammates grow by providing anonymous feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Your responses are completely anonymous. Teammates will only see aggregated feedback from 3+ peers.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {teammates.slice(0, 3).map((teammate) => (
            <div
              key={teammate.user_id}
              className="flex items-center justify-between p-3 rounded border"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {teammate.first_name} {teammate.last_name}
                </span>
                {teammate.has_completed_self_assessment && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <Button
                size="sm"
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
