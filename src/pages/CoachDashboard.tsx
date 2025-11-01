import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { AthleteDetailDrawer } from "@/components/coach/AthleteDetailDrawer";
import { TeamColorCustomizer } from "@/components/coach/TeamColorCustomizer";
import { NotificationBell } from "@/components/NotificationBell";
import { RoleRequestButton } from "@/components/RoleRequestButton";
import { Target, LogOut, AlertTriangle, ClipboardCheck, Bell, Compass, ArrowRight, Menu } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Assessment {
  id: string;
  user_id: string;
  semester_label: string;
  timepoint: "pre" | "mid" | "end";
  composite_mean: number;
  final_composite_mean: number;
  peer_adjusted_composite: number | null;
  coach_adjusted_composite: number | null;
  peer_modifier: number;
  coach_modifier: number;
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
  finalComposite: number;
  peerModifier: number;
  coachModifier: number;
  leadershipDna: number;
  excellence: number;
  accountability: number;
  discipline: number;
  belonging: number;
  classification: string;
  status: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCoachAndAdmin } = useUserRole();

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

    const { data: role, error: roleError } = await supabase.rpc('get_user_role', {
      _user_id: user.id
    });

    if (roleError || !role) {
      toast({
        title: "Error",
        description: "Failed to verify permissions",
        variant: "destructive",
      });
      return;
    }

    if (role !== "coach" && role !== "admin") {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to coaches and admins",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setUserRole(role);
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
        .from("profiles_secure")
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

    // Create athlete rows from ALL profiles, not just those with assessments
    const rows: AthleteRow[] = filteredProfiles.map((profile) => {
      // Try to find an assessment for this athlete
      const assessment = assessments.find(
        (a) =>
          a.user_id === profile.id &&
          a.semester_label === selectedSemester &&
          a.timepoint === selectedTimepoint
      );

      // If assessment exists, use real data; otherwise use defaults
      if (assessment) {
        return {
          userId: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          sport: profile.sport || "N/A",
          composite: assessment.composite_mean || 0,
          finalComposite: assessment.final_composite_mean || assessment.composite_mean || 0,
          peerModifier: assessment.peer_modifier || 0,
          coachModifier: assessment.coach_modifier || 0,
          leadershipDna: assessment.leadership_dna_mean || 0,
          excellence: assessment.excellence_mean || 0,
          accountability: assessment.accountability_mean || 0,
          discipline: assessment.discipline_mean || 0,
          belonging: assessment.belonging_mean || 0,
          classification: assessment.classification || "N/A",
          status: "Completed",
        };
      } else {
        // No assessment found - show athlete with "Not Completed" status
        return {
          userId: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          sport: profile.sport || "N/A",
          composite: 0,
          finalComposite: 0,
          peerModifier: 0,
          coachModifier: 0,
          leadershipDna: 0,
          excellence: 0,
          accountability: 0,
          discipline: 0,
          belonging: 0,
          classification: "Not Completed",
          status: "Not Completed",
        };
      }
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
      case "Not Completed":
        return "bg-gray-200 text-gray-700 border border-gray-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Calculate summary statistics
  const totalAthletes = athleteRows.length;
  const completedAssessments = athleteRows.filter(row => row.status === "Completed");
  const avgComposite =
    completedAssessments.length > 0
      ? (completedAssessments.reduce((sum, row) => sum + row.finalComposite, 0) / completedAssessments.length).toFixed(2)
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
        ? tpAssessments.reduce((sum, a) => sum + (a.final_composite_mean || a.composite_mean || 0), 0) / tpAssessments.length
        : 0;
    return {
      timepoint: tp.charAt(0).toUpperCase() + tp.slice(1),
      composite: parseFloat(avg.toFixed(2)),
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Calculate watchlist (low discipline/accountability)
  const watchlist = athleteRows.filter(
    row => row.discipline < 3.0 || row.accountability < 3.0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with Coach Branding */}
      <header className="bg-[hsl(var(--coach-accent))] border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo - Always visible */}
          <div className="flex items-center gap-2 lg:gap-4">
            <img 
              src={logo} 
              alt="FLY.TE Academy Logo" 
              className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
            <div className="hidden lg:flex items-center gap-2 text-[hsl(var(--coach-accent-foreground))]">
              <Target className="h-5 w-5" />
              <span className="text-lg font-semibold">Coach</span>
              <Badge variant="secondary" className="ml-2">Build Better Leaders</Badge>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell />
            <RoleRequestButton />
            {isCoachAndAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/admin")}
              >
                <Compass className="mr-2 h-4 w-4" />
                Admin View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button - Visible on mobile and tablet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-[hsl(var(--coach-accent-foreground))] hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background z-50">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Coach
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-center pb-4 border-b">
                  <NotificationBell />
                </div>
                
                <div className="flex flex-col items-center pb-4 border-b">
                  <RoleRequestButton />
                </div>

                {isCoachAndAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/admin");
                    }}
                    className="w-full justify-start"
                  >
                    <Compass className="mr-2 h-4 w-4" />
                    Admin View
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team Overview</h1>
          <p className="text-muted-foreground">Monitor athlete development and provide guidance</p>
        </div>

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

      {/* Coach Assessment Prompt - Prominent */}
      {athleteRows.length > 0 && (
        <Card className="border-[hsl(var(--coach-accent))] border-2 shadow-elegant bg-gradient-to-br from-background to-[hsl(var(--coach-accent))]/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--coach-accent))]/10 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-[hsl(var(--coach-accent))]" />
                </div>
                Coach Assessments
                <Badge className="bg-[hsl(var(--coach-accent))] text-white animate-pulse">
                  <Bell className="h-3 w-3 mr-1" />
                  Action Needed
                </Badge>
              </CardTitle>
            </div>
            <p className="text-base text-muted-foreground mt-2">
              🎯 Provide leadership evaluations for your athletes
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {athleteRows.slice(0, 6).map((athlete) => (
                <div
                  key={athlete.userId}
                  className="flex items-center justify-between p-4 rounded-lg border-2 hover:border-[hsl(var(--coach-accent))] hover:shadow-md transition-all bg-card"
                >
                  <div>
                    <p className="font-semibold">{athlete.name}</p>
                    <p className="text-sm text-muted-foreground">{athlete.sport}</p>
                  </div>
                  <Button
                    className="bg-[hsl(var(--coach-accent))] hover:bg-[hsl(var(--coach-accent))]/90"
                    onClick={() => navigate(`/coach/assess?athleteId=${athlete.userId}`)}
                  >
                    Assess
                  </Button>
                </div>
              ))}
            </div>
            {athleteRows.length > 6 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                +{athleteRows.length - 6} more athletes available to assess
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Color Customizer */}
      {selectedTeam !== "all" && (
        <TeamColorCustomizer teamId={selectedTeam} />
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[hsl(var(--coach-accent))]">
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
            <div className="text-3xl font-bold text-[hsl(var(--coach-accent))]">{avgComposite}</div>
          </CardContent>
        </Card>

        <Card className={watchlist.length > 0 ? "border-l-4 border-l-destructive" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{watchlist.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Athletes needing attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Classification Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-1 flex-wrap">
            {["Foundational", "Developing", "Emerging", "Transformational"].map((cls) => (
              <Badge key={cls} className={`text-xs ${getClassificationColor(cls)}`}>
                {cls.slice(0, 1)}: {classificationCounts[cls] || 0}
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
                <TableHead>Timepoints</TableHead>
                <TableHead>Composite</TableHead>
                <TableHead>Leadership DNA</TableHead>
                <TableHead>Excellence</TableHead>
                <TableHead>Accountability</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Belonging</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {athleteRows.map((row) => {
                // Get athlete's completed timepoints for this semester
                const athleteAssessments = assessments.filter(
                  (a) => a.user_id === row.userId && a.semester_label === selectedSemester
                );
                const completedTimepoints = athleteAssessments.map((a) => a.timepoint);
                
                return (
                  <TableRow
                    key={row.userId}
                    className="hover:bg-muted/50"
                  >
                    <TableCell 
                      className="font-medium cursor-pointer"
                      onClick={() => setSelectedAthlete(row.userId)}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.sport}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      <div className="flex gap-1">
                        {["pre", "mid", "end"].map((tp) => {
                          const completed = completedTimepoints.includes(tp as any);
                          return (
                            <Badge
                              key={tp}
                              variant={completed ? "default" : "outline"}
                              className={`text-xs ${completed ? "bg-green-600" : "bg-gray-200"}`}
                            >
                              {tp === "pre" ? "P" : tp === "mid" ? "M" : "E"}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.status === "Not Completed" ? "-" : (
                        <div>
                          <div className="font-semibold">{row.finalComposite.toFixed(2)}</div>
                          {(row.peerModifier !== 0 || row.coachModifier !== 0) && (
                            <div className="text-xs text-muted-foreground">
                              Self: {row.composite.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.classification === "Not Completed" ? "-" : row.leadershipDna.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.classification === "Not Completed" ? "-" : row.excellence.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.classification === "Not Completed" ? "-" : row.accountability.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.classification === "Not Completed" ? "-" : row.discipline.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      {row.classification === "Not Completed" ? "-" : row.belonging.toFixed(2)}
                    </TableCell>
                    <TableCell onClick={() => setSelectedAthlete(row.userId)} className="cursor-pointer">
                      <Badge className={getClassificationColor(row.classification)}>{row.classification}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/coach/assess?athleteId=${row.userId}`);
                        }}
                      >
                        Assess
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </div>
  );
}
