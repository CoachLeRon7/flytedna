import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Nudge {
  id: string;
  domain: string;
  title: string;
  body: string;
  frequency: string;
  status: string;
}

export function NudgesList({ userId }: { userId: string }) {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNudges();
  }, [userId]);

  const loadNudges = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("nudges")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["scheduled", "sent"])
      .order("created_at", { ascending: false });

    setNudges(data || []);
    setLoading(false);
  };

  const markComplete = async (nudgeId: string) => {
    const { error } = await supabase
      .from("nudges")
      .update({ status: "completed" })
      .eq("id", nudgeId);

    if (!error) {
      toast({ title: "Great job!", description: "Nudge completed" });
      loadNudges();
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[hsl(var(--student-accent))]" />
            🔔 My Nudges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[hsl(var(--student-accent))]" />
          🔔 My Nudges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nudges.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No active nudges. Keep up the great work!</p>
        ) : (
          <div className="space-y-3">
            {nudges.map((nudge) => (
              <div key={nudge.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{nudge.domain}</Badge>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {nudge.frequency}
                      </Badge>
                    </div>
                    <h4 className="font-semibold">{nudge.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{nudge.body}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markComplete(nudge.id)}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
