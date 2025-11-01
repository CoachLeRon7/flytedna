import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Shield, Target } from 'lucide-react';

type RequestableRole = 'admin' | 'coach';

export const RoleRequestButton = () => {
  const { roles, isAdmin, isCoach, refetch } = useUserRole();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestingRole, setRequestingRole] = useState<RequestableRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine what role the user can request
  const canRequestAdmin = isCoach && !isAdmin;
  const canRequestCoach = isAdmin && !isCoach;
  
  // If user has both roles or is student-only, don't show the button
  if ((isAdmin && isCoach) || (!isAdmin && !isCoach)) {
    return null;
  }

  const handleRequestClick = (role: RequestableRole) => {
    setRequestingRole(role);
    setIsDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestingRole) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('request_additional_role', {
        _requested_role: requestingRole
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result.success) {
        toast({
          title: "Request Submitted",
          description: result.message,
        });
        setIsDialogOpen(false);
        refetch();
      } else {
        toast({
          title: "Request Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error submitting role request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit role request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleInfo = (role: RequestableRole) => {
    if (role === 'admin') {
      return {
        icon: Shield,
        title: "Request Administrator Access",
        description: "Administrator access includes all coach capabilities plus:",
        permissions: [
          "Manage all users and role assignments",
          "Create and manage teams",
          "Send announcements to all users",
          "View system-wide analytics",
          "Access all data across teams"
        ]
      };
    } else {
      return {
        icon: Target,
        title: "Request Coach Access",
        description: "Coach access provides the following capabilities:",
        permissions: [
          "Assess athletes on your teams",
          "View team performance analytics",
          "Monitor athlete progress and development",
          "Access detailed athlete insights",
          "Manage team settings and colors"
        ]
      };
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {roles.map(role => (
            <Badge key={role} variant="secondary">
              {role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <Target className="w-3 h-3 mr-1" />}
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          ))}
        </div>
        
        {canRequestAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRequestClick('admin')}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Request Admin Access
          </Button>
        )}
        
        {canRequestCoach && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRequestClick('coach')}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Request Coach Access
          </Button>
        )}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          {requestingRole && (() => {
            const info = getRoleInfo(requestingRole);
            const Icon = info.icon;
            return (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {info.title}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left space-y-3">
                    <p>{info.description}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {info.permissions.map((permission, idx) => (
                        <li key={idx}>{permission}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      Your request will be reviewed by an administrator. You'll maintain your current {roles[0]} access while the request is pending.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmitRequest} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            );
          })()}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
