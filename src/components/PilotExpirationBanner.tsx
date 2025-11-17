import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { usePackageAccess } from "@/hooks/usePackageAccess";

export const PilotExpirationBanner = () => {
  const navigate = useNavigate();
  const { accessStatus } = usePackageAccess();

  if (
    accessStatus?.status !== 'active' || 
    !accessStatus.isPilot || 
    !accessStatus.daysRemaining
  ) {
    return null;
  }

  if (accessStatus.daysRemaining > 14) {
    return null;
  }

  const isUrgent = accessStatus.daysRemaining <= 7;

  return (
    <Alert 
      className="mb-4" 
      variant={isUrgent ? "destructive" : "default"}
    >
      {isUrgent ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <AlertTitle>
        {isUrgent ? 'Pilot Access Expiring Soon!' : 'Pilot Access Ending'}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {accessStatus.daysRemaining} day{accessStatus.daysRemaining !== 1 ? 's' : ''} remaining 
          in your pilot period. Upgrade now to keep your access and data.
        </span>
        <Button 
          variant={isUrgent ? "secondary" : "default"}
          size="sm"
          onClick={() => navigate('/pricing')}
          className="ml-4"
        >
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
};
