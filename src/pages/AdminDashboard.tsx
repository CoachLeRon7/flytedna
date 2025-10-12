import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Compass, Users, TrendingUp, Download, Settings, Shield, MessageSquare, LogOut } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    totalCoaches: 0,
    totalTeams: 0,
    avgComposite: 0,
    transformationalPercent: 0,
    participationRate: 0,
  });

  useEffect(() => {
    checkAccessAndLoadData();
  }, []);

  const checkAccessAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to administrators",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      await loadDashboardData();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: teams } = await supabase.from("teams").select("*");
    const { data: assessments } = await supabase.from("assessments").select("*");

    const totalAthletes = profiles?.filter(p => p.role === "student").length || 0;
    const totalCoaches = profiles?.filter(p => p.role === "coach").length || 0;
    const totalTeams = teams?.length || 0;

    const avgComposite = assessments?.length
      ? assessments.reduce((sum, a) => sum + (a.composite_mean || 0), 0) / assessments.length
      : 0;

    const transformationalCount = assessments?.filter(a => a.classification === "Transformational").length || 0;
    const transformationalPercent = assessments?.length
      ? (transformationalCount / assessments.length) * 100
      : 0;

    const uniqueUsers = new Set(assessments?.map(a => a.user_id)).size;
    const participationRate = totalAthletes > 0 ? (uniqueUsers / totalAthletes) * 100 : 0;

    setStats({
      totalAthletes,
      totalCoaches,
      totalTeams,
      avgComposite: parseFloat(avgComposite.toFixed(2)),
      transformationalPercent: parseFloat(transformationalPercent.toFixed(1)),
      participationRate: parseFloat(participationRate.toFixed(1)),
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with Admin Branding */}
      <header className="bg-[hsl(var(--admin-accent))] border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={logo} alt="FLY.TE Academy Logo" className="h-12 w-auto" />
            <div className="flex items-center gap-2 text-[hsl(var(--admin-accent-foreground))]">
              <Compass className="h-5 w-5" />
              <span className="text-lg font-semibold">Administrator</span>
              <Badge variant="secondary" className="ml-2">Empower the Mission</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Global Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor program health and leadership development across all teams</p>
        </div>

        {/* Program Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow border-l-4 border-l-[hsl(var(--admin-accent))]">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Athletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[hsl(var(--admin-accent))]">{stats.totalAthletes}</p>
              <p className="text-sm text-muted-foreground mt-1">Across {stats.totalTeams} teams</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow border-l-4 border-l-[hsl(var(--transformational))]">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Transformational Leaders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[hsl(var(--transformational-foreground))]">{stats.transformationalPercent}%</p>
              <p className="text-sm text-muted-foreground mt-1">Program leadership excellence</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow border-l-4 border-l-[hsl(var(--success))]">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[hsl(var(--success))]">{stats.participationRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Assessment completion</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">System Management</TabsTrigger>
            <TabsTrigger value="export">Export Center</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Average Composite Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary mb-2">{stats.avgComposite}</div>
                  <p className="text-sm text-muted-foreground">Program-wide leadership score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Teams</span>
                    <span className="font-bold">{stats.totalTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Coaches</span>
                    <span className="font-bold">{stats.totalCoaches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Athletes</span>
                    <span className="font-bold">{stats.totalAthletes}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users & Roles
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Teams & Assignments
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Program Announcements
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Export comprehensive reports for grants, presentations, and program evaluation
                </p>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Assessment Data (CSV)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Program Summary (PDF)
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Reflection Summaries
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
