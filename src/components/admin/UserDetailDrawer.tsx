import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Activity, Mail, Calendar, TrendingUp, Users, Target } from "lucide-react";

interface UserActivity {
  id: string;
  activity_type: string;
  activity_details: any;
  created_at: string;
}

interface UserDetailDrawerProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({ userId, open, onOpenChange }: UserDetailDrawerProps) {
  const [userData, setUserData] = useState<any>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && open) {
      loadUserData();
      loadActivities();
    }
  }, [userId, open]);

  const loadUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('user_activity_summary_rls')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return '🔐';
      case 'assessment_completed':
        return '✅';
      case 'peer_assessment_completed':
        return '👥';
      case 'coach_assessment_completed':
        return '🏅';
      case 'growth_plan_updated':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getActivityLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading || !userData) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Loading...</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
  }

  const initials = `${userData.first_name?.[0] || ''}${userData.last_name?.[0] || ''}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DrawerTitle className="text-2xl">
                {userData.first_name} {userData.last_name}
              </DrawerTitle>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{userData.email}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant={userData.is_active ? "default" : "secondary"}>
                  {userData.is_active ? "Active" : "Archived"}
                </Badge>
                <Badge variant="outline">{userData.role || 'student'}</Badge>
                {userData.team_name && (
                  <Badge variant="outline">{userData.team_name}</Badge>
                )}
              </div>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  icon={<Activity className="h-5 w-5" />}
                  label="Assessments"
                  value={userData.total_assessments || 0}
                />
                <StatCard
                  icon={<Users className="h-5 w-5" />}
                  label="Peer Reviews Given"
                  value={userData.peer_assessments_given || 0}
                />
                <StatCard
                  icon={<Users className="h-5 w-5" />}
                  label="Peer Reviews Received"
                  value={userData.peer_assessments_received || 0}
                />
                <StatCard
                  icon={<Target className="h-5 w-5" />}
                  label="Growth Plans"
                  value={userData.growth_plans_count || 0}
                />
                <StatCard
                  icon={<Calendar className="h-5 w-5" />}
                  label="Total Logins"
                  value={userData.login_count || 0}
                />
                {userData.role === 'coach' && (
                  <StatCard
                    icon={<Activity className="h-5 w-5" />}
                    label="Coach Assessments"
                    value={userData.coach_assessments_given || 0}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {userData.last_login_at && (
                  <TimelineItem
                    icon="🔐"
                    label="Last Login"
                    timestamp={userData.last_login_at}
                  />
                )}
                {userData.last_assessment_date && (
                  <TimelineItem
                    icon="✅"
                    label="Last Assessment"
                    timestamp={userData.last_assessment_date}
                  />
                )}
                {userData.last_peer_assessment_given && (
                  <TimelineItem
                    icon="👥"
                    label="Last Peer Review"
                    timestamp={userData.last_peer_assessment_given}
                  />
                )}
                {userData.last_growth_plan_update && (
                  <TimelineItem
                    icon="🎯"
                    label="Growth Plan Updated"
                    timestamp={userData.last_growth_plan_update}
                  />
                )}
                <TimelineItem
                  icon="📅"
                  label="Account Created"
                  timestamp={userData.account_created_at}
                />
              </div>
            </div>

            <Separator />

            {/* Detailed Activity Log */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {getActivityLabel(activity.activity_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function TimelineItem({ icon, label, timestamp }: { icon: string; label: string; timestamp: string }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(timestamp), 'PPp')}
        </p>
      </div>
    </div>
  );
}
