import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Users, Palette, Save, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Team {
  id: string;
  name: string;
  sport: string;
  institution: string | null;
  primary_color: string;
  secondary_color: string;
  coach_ids: string[];
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  sport: string | null;
  team_id: string | null;
}

export const TeamManagementDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // New team form state
  const [newTeam, setNewTeam] = useState({
    name: "",
    sport: "",
    institution: "",
    primary_color: "#1E40AF",
    secondary_color: "#3B82F6",
  });

  // Edit team state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);

    // Load teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .order("name");
    setTeams(teamsData || []);

    // Load coaches with their role
    const { data: coachRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "coach");

    const coachIds = coachRoles?.map(r => r.user_id) || [];

    if (coachIds.length > 0) {
      const { data: coachProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", coachIds);
      setCoaches(coachProfiles || []);
    }

    // Load students
    const { data: studentRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "student");

    const studentIds = studentRoles?.map(r => r.user_id) || [];

    if (studentIds.length > 0) {
      const { data: studentProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", studentIds);
      setStudents(studentProfiles || []);
    }

    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.sport) {
      toast({
        title: "Missing information",
        description: "Please fill in team name and sport",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("teams").insert({
      name: newTeam.name,
      sport: newTeam.sport,
      institution: newTeam.institution || null,
      primary_color: newTeam.primary_color,
      secondary_color: newTeam.secondary_color,
    });

    if (error) {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Team created!",
      description: `${newTeam.name} has been created successfully`,
    });

    setNewTeam({
      name: "",
      sport: "",
      institution: "",
      primary_color: "#1E40AF",
      secondary_color: "#3B82F6",
    });

    loadData();
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    const { error } = await supabase
      .from("teams")
      .update({
        name: editingTeam.name,
        sport: editingTeam.sport,
        institution: editingTeam.institution,
        primary_color: editingTeam.primary_color,
        secondary_color: editingTeam.secondary_color,
        coach_ids: editingTeam.coach_ids,
      })
      .eq("id", editingTeam.id);

    if (error) {
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Team updated!",
      description: "Changes saved successfully",
    });

    setEditingTeam(null);
    loadData();
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This will unassign all students.")) return;

    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Team deleted",
      description: "Team has been removed",
    });

    loadData();
  };

  const handleAssignCoachToTeam = async (teamId: string, coachId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const updatedCoachIds = team.coach_ids.includes(coachId)
      ? team.coach_ids.filter(id => id !== coachId)
      : [...team.coach_ids, coachId];

    const { error } = await supabase
      .from("teams")
      .update({ coach_ids: updatedCoachIds })
      .eq("id", teamId);

    if (error) {
      toast({
        title: "Error updating coach assignment",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coach assignment updated",
      description: "Changes saved successfully",
    });

    loadData();
  };

  const handleAssignStudentToTeam = async (studentId: string, teamId: string | null) => {
    const { error } = await supabase
      .from("profiles")
      .update({ team_id: teamId })
      .eq("id", studentId);

    if (error) {
      toast({
        title: "Error assigning student",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Student assignment updated",
      description: "Changes saved successfully",
    });

    loadData();
  };

  const toggleCoachAssignment = (coachId: string) => {
    if (!editingTeam) return;
    
    const updatedCoachIds = editingTeam.coach_ids.includes(coachId)
      ? editingTeam.coach_ids.filter(id => id !== coachId)
      : [...editingTeam.coach_ids, coachId];

    setEditingTeam({ ...editingTeam, coach_ids: updatedCoachIds });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Configuration & Assignments</DialogTitle>
          <DialogDescription>
            Manage teams, assign coaches, and organize student-athletes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="coaches">Coach Assignments</TabsTrigger>
            <TabsTrigger value="students">Student Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            {/* Create New Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Team Name *</Label>
                    <Input
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="e.g., Varsity Football"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sport *</Label>
                    <Input
                      value={newTeam.sport}
                      onChange={(e) => setNewTeam({ ...newTeam, sport: e.target.value })}
                      placeholder="e.g., Football"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={newTeam.institution}
                      onChange={(e) => setNewTeam({ ...newTeam, institution: e.target.value })}
                      placeholder="e.g., University of Michigan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={newTeam.primary_color}
                        onChange={(e) => setNewTeam({ ...newTeam, primary_color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={newTeam.primary_color}
                        onChange={(e) => setNewTeam({ ...newTeam, primary_color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </CardContent>
            </Card>

            {/* Existing Teams */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Teams ({teams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4">
                      {editingTeam?.id === team.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Team Name</Label>
                              <Input
                                value={editingTeam.name}
                                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sport</Label>
                              <Input
                                value={editingTeam.sport}
                                onChange={(e) => setEditingTeam({ ...editingTeam, sport: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Institution</Label>
                              <Input
                                value={editingTeam.institution || ""}
                                onChange={(e) => setEditingTeam({ ...editingTeam, institution: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Primary Color</Label>
                              <Input
                                type="color"
                                value={editingTeam.primary_color}
                                onChange={(e) => setEditingTeam({ ...editingTeam, primary_color: e.target.value })}
                                className="h-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Assigned Coaches</Label>
                            <div className="flex flex-wrap gap-2">
                              {coaches.map((coach) => (
                                <Badge
                                  key={coach.id}
                                  variant={editingTeam.coach_ids.includes(coach.id) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => toggleCoachAssignment(coach.id)}
                                >
                                  {coach.first_name} {coach.last_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateTeam} size="sm">
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </Button>
                            <Button onClick={() => setEditingTeam(null)} variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">{team.sport}</p>
                            {team.institution && (
                              <p className="text-sm text-muted-foreground">{team.institution}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {team.coach_ids.length} coach{team.coach_ids.length !== 1 ? 'es' : ''}
                              </Badge>
                              <Badge variant="secondary">
                                {students.filter(s => s.team_id === team.id).length} student{students.filter(s => s.team_id === team.id).length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => setEditingTeam(team)} variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => handleDeleteTeam(team.id)} variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coaches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coach Team Assignments</CardTitle>
                <CardDescription>Assign coaches to teams they oversee</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Coach Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Teams</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coaches.map((coach) => (
                      <TableRow key={coach.id}>
                        <TableCell className="font-medium">
                          {coach.first_name} {coach.last_name}
                        </TableCell>
                        <TableCell>{coach.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {teams.map((team) => (
                              <Badge
                                key={team.id}
                                variant={team.coach_ids.includes(coach.id) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleAssignCoachToTeam(team.id, coach.id)}
                              >
                                {team.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Team Assignments</CardTitle>
                <CardDescription>Assign student-athletes to their teams</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Current Team</TableHead>
                      <TableHead>Assign to Team</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.sport || "Not set"}</TableCell>
                        <TableCell>
                          {student.team_id ? (
                            <Badge>{teams.find(t => t.id === student.team_id)?.name}</Badge>
                          ) : (
                            <Badge variant="outline">No team</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={student.team_id || "none"}
                            onValueChange={(value) => handleAssignStudentToTeam(student.id, value === "none" ? null : value)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No team</SelectItem>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
