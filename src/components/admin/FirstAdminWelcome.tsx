import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export function FirstAdminWelcome() {
  const navigate = useNavigate();
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    checkFirstAdminStatus();
  }, []);

  const checkFirstAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has first_admin_auto_approved activity
      const { data: activityLog } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'first_admin_auto_approved')
        .single();

      if (activityLog) {
        setIsFirstAdmin(true);
        
        // Check if user has seen the welcome (via activity log)
        const { data: setupComplete } = await supabase
          .from('user_activity_log')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'first_admin_setup_complete')
          .single();

        if (!setupComplete) {
          setHasSeenWelcome(false);
          setOpen(true);
        } else {
          setHasSeenWelcome(true);
        }
      }
    } catch (error) {
      console.error('Error checking first admin status:', error);
    }
  };

  const markWelcomeSeen = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: 'first_admin_setup_complete',
        activity_details: {
          timestamp: new Date().toISOString(),
          completed_onboarding: true
        }
      });

      setOpen(false);
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
    }
  };

  if (!isFirstAdmin || hasSeenWelcome) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Compass className="h-6 w-6" />
            Welcome, First Administrator!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You've been granted administrator access as the first admin of this FLDI system.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">As an administrator, you can:</h4>
            <ul className="space-y-1 text-sm">
              <li>✅ View and manage all users</li>
              <li>✅ Approve coach and admin role requests</li>
              <li>✅ Create and manage teams</li>
              <li>✅ Send announcements</li>
              <li>✅ Access analytics and reports</li>
              <li>✅ Export data</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold mb-2">⚠️ Important Security Notes:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Future admin requests will require YOUR approval</li>
              <li>• All admin actions are logged for audit purposes</li>
              <li>• Be cautious when granting admin access to others</li>
            </ul>
          </div>
          
          <Button onClick={markWelcomeSeen} className="w-full">
            Go to Admin Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
