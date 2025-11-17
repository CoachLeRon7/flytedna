import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, History } from "lucide-react";
import { usePackageAccess } from "@/hooks/usePackageAccess";

interface AccessGateProps {
  children: React.ReactNode;
  requireAccess?: boolean;
}

export const AccessGate = ({ children, requireAccess = false }: AccessGateProps) => {
  const navigate = useNavigate();
  const { accessStatus, loading } = usePackageAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (accessStatus?.status === 'no_access') {
    return (
      <div className="container max-w-4xl mx-auto py-20">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-destructive" />
              <CardTitle>Membership Required</CardTitle>
            </div>
            <CardDescription>
              You need an active membership to access this feature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Get started with FLDI and unlock your leadership potential.
            </p>
            <Button onClick={() => navigate('/pricing')} size="lg">
              View Pricing Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessStatus?.status === 'expired') {
    return (
      <div className="container max-w-4xl mx-auto py-20">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-warning" />
              <CardTitle>
                {accessStatus.isPilot ? 'Pilot Access Expired' : 'Membership Expired'}
              </CardTitle>
            </div>
            <CardDescription>
              {accessStatus.isPilot 
                ? 'Your 90-day pilot period has ended.'
                : 'Your membership has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              {requireAccess 
                ? 'This feature requires an active membership. Upgrade to continue creating assessments.'
                : 'You can still view your historical assessment data, but creating new assessments requires an active membership.'}
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/pricing')} size="lg">
                Upgrade Now
              </Button>
              {!requireAccess && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/results')}
                >
                  View Past Assessments
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
