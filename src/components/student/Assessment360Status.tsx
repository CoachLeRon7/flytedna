import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users, UserCheck } from "lucide-react";
import { useAssessment360Status } from "@/hooks/useAssessment360Status";
import { formatTimepointDisplay, AssessmentTimepoint } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Assessment360StatusProps {
  userId: string | undefined;
  timepoint: AssessmentTimepoint;
  semesterLabel: string;
}

export function Assessment360Status({ userId, timepoint, semesterLabel }: Assessment360StatusProps) {
  const { status, loading } = useAssessment360Status(userId, timepoint, semesterLabel);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            360° Assessment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const peerProgress = Math.min((status.peerCount / 3) * 100, 100);
  
  return (
    <Card className="shadow-card border-l-4 border-l-[hsl(var(--student-accent))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          360° Assessment Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {semesterLabel} - {formatTimepointDisplay(timepoint)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Self-Assessment */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          {status.selfCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">Self-Assessment</p>
              {status.selfCompleted ? (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status.selfCompleted 
                ? `Completed on ${new Date(status.selfCompletedDate!).toLocaleDateString()}`
                : "Start your self-assessment to begin the 360° feedback process"
              }
            </p>
          </div>
        </div>

        {/* Peer Feedback */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          {status.peerMinimumMet ? (
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          ) : (
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">Peer Feedback</p>
              {status.peerMinimumMet ? (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  {status.peerCount} responses
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {status.peerCount}/3 minimum
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {status.peerMinimumMet 
                ? `${status.peerCount} peer assessments completed - included in your final score (15% weight)`
                : status.peerCount === 0
                  ? "No peer assessments yet - your teammates can assess you anonymously"
                  : `${3 - status.peerCount} more peer ${3 - status.peerCount === 1 ? 'assessment' : 'assessments'} needed for inclusion in your score`
              }
            </p>
            {!status.peerMinimumMet && (
              <Progress value={peerProgress} className="h-2" />
            )}
          </div>
        </div>

        {/* Coach Assessment */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          {status.coachCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
          ) : (
            <UserCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">Coach Assessment</p>
              {status.coachCompleted ? (
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {status.coachCompleted 
                ? `Completed on ${new Date(status.coachCompletedDate!).toLocaleDateString()} - adds 25% to your final score`
                : "Your coach has not yet completed your assessment - this adds valuable perspective (25% weight)"
              }
            </p>
          </div>
        </div>

        {/* Score Weighting Info */}
        <div className="bg-[hsl(var(--student-accent))]/5 p-4 rounded-lg border border-[hsl(var(--student-accent))]/20">
          <p className="text-sm font-medium mb-2">💡 How Your Final Score is Calculated:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Self-Assessment:</strong> {status.selfCompleted ? '60% weight ✓' : '60% weight (required)'}</li>
            <li>• <strong>Peer Feedback:</strong> {status.peerMinimumMet ? '15% weight ✓' : '15% weight (needs 3+ responses)'}</li>
            <li>• <strong>Coach Assessment:</strong> {status.coachCompleted ? '25% weight ✓' : '25% weight (optional)'}</li>
          </ul>
          {!status.peerMinimumMet && !status.coachCompleted && (
            <p className="text-xs text-muted-foreground mt-3 italic">
              Complete components are automatically weighted to ensure you always get a final score
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
