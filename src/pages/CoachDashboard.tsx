import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AthleteDetailDrawer } from "@/components/coach/AthleteDetailDrawer";

interface Assessment {
  id: string;
  user_id: string;
  semester_label: string;
  timepoint: "pre" | "mid" | "end";
  composite_mean: number;
  leadership_dna_mean: number;
  excellence_mean: number;
  accountability_mean: number;
  discipline_mean: number;
  belonging_mean: number;
  classification: string;
  notes_private: string | null;
  reflections: any;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  sport: string;
  team_id: string | null;
}

interface AthleteRow {
  userId: string;
  name: string;
  sport: string;
  composite: number;
  leadershipDna: number;
  excellence: number;
  accountability: number;
  discipline: number;
  belonging: number;
  classification: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
}

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("Fall 2025");
  const [selectedTimepoint, setSelectedTimepoint] = useState<string>("end");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [athleteRows, setAthleteRows] = useState<AthleteRow[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);

  // Check user role and load data
  useEffect(() => {
    checkRoleAndLoadData();
  }, []);

  // Filter data when filters change
  useEffect(() => {
    if (assessments.length > 0 && profiles.length > 0) {
      filterAndAggregateData();
    }
  }, [selectedTeam, selectedSemester, selectedTimepoint, assessments, profiles]);

  const checkRoleAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        return;
      }

      if (profile.role !== "coach" && profile.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to coaches and admins",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUserRole(profile.role);
      await loadTeamsAndData(user.id);
    } catch (error) {
      console.error("Error checking role:", error);
      toast({
        title: "Error",
        description: "Failed to verify permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamsAndData = async (userId: string) => {
    try {
      // Load teams where user is a coach
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .contains("coach_ids", [userId]);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Load all profiles (will filter by team later)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Load all assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*");

      if (assessmentsError) throw assessmentsError;
      setAssessments(assessmentsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const filterAndAggregateData = () => {
    // Filter profiles by team
    let filteredProfiles = profiles;
    if (selectedTeam !== "all") {
      filteredProfiles = profiles.filter((p) => p.team_id === selectedTeam);
    } else if (teams.length > 0) {
      const teamIds = teams.map((t) => t.id);
      filteredProfiles = profiles.filter((p) => p.team_id && teamIds.includes(p.team_id));
    }

    // Filter assessments by semester and timepoint
    const filteredAssessments = assessments.filter(
      (a) =>
        a.semester_label === selectedSemester &&
        a.timepoint === selectedTimepoint &&
        filteredProfiles.some((p) => p.id === a.user_id)
    );

    // Create athlete rows
    const rows: AthleteRow[] = filteredAssessments.map((assessment) => {
      const profile = filteredProfiles.find((p) => p.id === assessment.user_id);
      return {
        userId: assessment.user_id,
        name: profile ? `${profile.first_name} ${profile.last_name}` : "Unknown",
        sport: profile?.sport || "N/A",
        composite: assessment.composite_mean || 0,
        leadershipDna: assessment.leadership_dna_mean || 0,
        excellence: assessment.excellence_mean || 0,
        accountability: assessment.accountability_mean || 0,
        discipline: assessment.discipline_mean || 0,
        belonging: assessment.belonging_mean || 0,
        classification: assessment.classification || "N/A",
      };
    });

    setAthleteRows(rows);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Foundational":
        return "bg-[hsl(var(--foundational))] text-[hsl(var(--foundational-foreground))]";
      case "Developing":
        return "bg-[hsl(var(--developing))] text-[hsl(var(--developing-foreground))]";
      case "Emerging":
        return "bg-[hsl(var(--emerging))] text-[hsl(var(--emerging-foreground))]";
      case "Transformational":
        return "bg-[hsl(var(--transformational))] text-[hsl(var(--transformational-foreground))]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calculate summary statistics
  const totalAthletes = athleteRows.length;
  const avgComposite =
    totalAthletes > 0
      ? (athleteRows.reduce((sum, row) => sum + row.composite, 0) / totalAthletes).toFixed(2)
      : "0.00";

  const classificationCounts = athleteRows.reduce(
    (acc, row) => {
      acc[row.classification] = (acc[row.classification] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Domain averages for bar chart
  const domainAverages = [
    {
      domain: "Leadership DNA",
      value:
        totalAthletes > 0
          ? athleteRows.reduce((sum, row) => sum + row.leadershipDna, 0) / totalAthletes
          : 0,
    },
    {
      domain: "Excellence",
      value:
        totalAthletes > 0 ? athleteRows.reduce((sum, row) => sum + row.excellence, 0) / totalAthletes : 0,
    },
    {
      domain: "Accountability",
      value:
        totalAthletes > 0
          ? athleteRows.reduce((sum, row) => sum + row.accountability, 0) / totalAthletes
          : 0,
    },
    {
      domain: "Discipline",
      value:
        totalAthletes > 0 ? athleteRows.reduce((sum, row) => sum + row.discipline, 0) / totalAthletes : 0,
    },
    {
      domain: "Belonging",
      value:
        totalAthletes > 0 ? athleteRows.reduce((sum, row) => sum + row.belonging, 0) / totalAthletes : 0,
    },
  ];

  // Trend data across timepoints
  const trendData = ["pre", "mid", "end"].map((tp) => {
    const tpAssessments = assessments.filter(
      (a) => a.semester_label === selectedSemester && a.timepoint === tp
    );
    const avg =
      tpAssessments.length > 0
        ? tpAssessments.reduce((sum, a) => sum + (a.composite_mean || 0), 0) / tpAssessments.length
        : 0;
    return {
      timepoint: tp.charAt(0).toUpperCase() + tp.slice(1),
      composite: parseFloat(avg.toFixed(2)),
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-4xl font-bold">Coach Dashboard</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Team</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Semester</label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                <SelectItem value="Fall 2024">Fall 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Timepoint</label>
            <Select value={selectedTimepoint} onValueChange={setSelectedTimepoint}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre">Pre</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="end">End</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAthletes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Composite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgComposite}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classification Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {["Foundational", "Developing", "Emerging", "Transformational"].map((cls) => (
              <Badge key={cls} className={getClassificationColor(cls)}>
                {cls}: {classificationCounts[cls] || 0}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Average Domain Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainAverages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composite Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timepoint" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="composite" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Athletes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Athletes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Composite</TableHead>
                <TableHead>Leadership DNA</TableHead>
                <TableHead>Excellence</TableHead>
                <TableHead>Accountability</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Belonging</TableHead>
                <TableHead>Classification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athleteRows.map((row) => (
                <TableRow
                  key={row.userId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedAthlete(row.userId)}
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.sport}</TableCell>
                  <TableCell>{row.composite.toFixed(2)}</TableCell>
                  <TableCell>{row.leadershipDna.toFixed(2)}</TableCell>
                  <TableCell>{row.excellence.toFixed(2)}</TableCell>
                  <TableCell>{row.accountability.toFixed(2)}</TableCell>
                  <TableCell>{row.discipline.toFixed(2)}</TableCell>
                  <TableCell>{row.belonging.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getClassificationColor(row.classification)}>{row.classification}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Athlete Detail Drawer */}
      {selectedAthlete && (
        <AthleteDetailDrawer
          athleteId={selectedAthlete}
          semester={selectedSemester}
          open={!!selectedAthlete}
          onClose={() => setSelectedAthlete(null)}
        />
      )}
    </div>
  );
}
