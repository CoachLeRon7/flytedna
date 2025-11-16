import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle2 } from "lucide-react";
import { z } from "zod";

interface Team {
  id: string;
  name: string;
  sport: string;
  institution: string | null;
}

const teamSelectionSchema = z.object({
  team_id: z.string().uuid("Invalid team ID"),
});

export const TeamSelector = ({ currentTeamId, onTeamSelected }: { currentTeamId: string | null; onTeamSelected: () => void }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, sport, institution")
      .order("name");

    if (error) {
      toast({
        title: "Error loading teams",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTeams(data || []);
  };

  const handleJoinTeam = async () => {
    if (!selectedTeamId) return;

    // Validate team_id
    try {
      teamSelectionSchema.parse({ team_id: selectedTeamId });
    } catch (error) {
      toast({
        title: "Invalid team selection",
        description: "Please select a valid team",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ team_id: selectedTeamId })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error joining team",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Success!",
      description: "You've joined the team",
    });
    
    setLoading(false);
    onTeamSelected();
  };

  if (currentTeamId) {
    const currentTeam = teams.find(t => t.id === currentTeamId);
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Your Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{currentTeam?.name}</p>
            <p className="text-sm text-muted-foreground">{currentTeam?.sport}</p>
            {currentTeam?.institution && (
              <p className="text-sm text-muted-foreground">{currentTeam.institution}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Join Your Team
        </CardTitle>
        <CardDescription>
          Select your team to unlock team features and peer assessments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name} - {team.sport} {team.institution && `(${team.institution})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleJoinTeam} 
          disabled={!selectedTeamId || loading}
          className="w-full"
          size="lg"
        >
          Join Team
        </Button>
      </CardContent>
    </Card>
  );
};
