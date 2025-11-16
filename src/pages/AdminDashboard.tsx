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
import { Compass, Users, TrendingUp, Download, Settings, Shield, MessageSquare, LogOut, Info, Target, Menu } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RoleRequestsManager } from "@/components/admin/RoleRequestsManager";
import { TeamManagementDialog } from "@/components/admin/TeamManagementDialog";
import { AnnouncementDialog } from "@/components/admin/AnnouncementDialog";
import { NotificationBell } from "@/components/NotificationBell";
import { RoleRequestButton } from "@/components/RoleRequestButton";
import { UserManagementDashboard } from "@/components/admin/UserManagementDashboard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FirstAdminWelcome } from "@/components/admin/FirstAdminWelcome";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserOrganization } from "@/hooks/useUserOrganization";
import { ArrowRight } from "lucide-react";
import { OrganizationManagement } from "@/components/admin/OrganizationManagement";
import { InvitationManager } from "@/components/admin/InvitationManager";
import { JoinRequestsManager } from "@/components/admin/JoinRequestsManager";
import { PerformanceDashboard } from "@/components/admin/PerformanceDashboard";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { RefundRequestsManager } from "@/components/admin/RefundRequestsManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teamManagementOpen, setTeamManagementOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isCoachAndAdmin } = useUserRole();
  const { isSuperAdmin, primaryOrg, loading: orgLoading } = useUserOrganization();
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

      // Check if user is org_admin or super_admin
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', {
        _user_id: user.id
      });

      // Check if user has any org_admin role
      const { data: orgMemberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .in('role', ['super_admin', 'org_admin']);

      if (!isSuperAdmin && (!orgMemberships || orgMemberships.length === 0)) {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to administrators",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Check if this user is the first admin
      const { data: activityLog } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', 'first_admin_auto_approved')
        .single();

      if (activityLog) {
        setIsFirstAdmin(true);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's organizations
    const { data: userOrgs } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'approved');

    const userOrgIds = userOrgs?.map(o => o.organization_id) || [];
    const isSuperAdmin = userOrgs?.some(o => o.role === 'super_admin');

    // Filter teams by organization
    let teamsQuery = supabase.from("teams").select("*");
    if (!isSuperAdmin) {
      teamsQuery = teamsQuery.in('organization_id', userOrgIds);
    }
    const { data: teams } = await teamsQuery;

    // Get profiles for teams in user's organizations
    const teamIds = teams?.map(t => t.id) || [];
    let profilesQuery = supabase.from("profiles").select("*");
    if (teamIds.length > 0) {
      profilesQuery = profilesQuery.in('team_id', teamIds);
    }
    const { data: profiles } = await profilesQuery;

    // Get assessments for profiles in user's organizations
    const profileIds = profiles?.map(p => p.id) || [];
    let assessmentsQuery = supabase.from("assessments").select("*");
    if (profileIds.length > 0) {
      assessmentsQuery = assessmentsQuery.in('user_id', profileIds);
    }
    const { data: assessments } = await assessmentsQuery;

    // Count roles using organization_members table
    let studentQuery = supabase
      .from("organization_members")
      .select("user_id", { count: "exact" })
      .eq("role", "student")
      .eq("status", "approved");
    
    let coachQuery = supabase
      .from("organization_members")
      .select("user_id", { count: "exact" })
      .eq("role", "coach")
      .eq("status", "approved");
    
    if (!isSuperAdmin) {
      studentQuery = studentQuery.in('organization_id', userOrgIds);
      coachQuery = coachQuery.in('organization_id', userOrgIds);
    }

    const { data: studentRoles } = await studentQuery;
    const { data: coachRoles } = await coachQuery;

    const totalAthletes = studentRoles?.length || 0;
    const totalCoaches = coachRoles?.length || 0;
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

  if (loading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <FirstAdminWelcome />
      
      {/* Header with Admin Branding */}
      <header className="bg-[hsl(var(--admin-accent))] border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo - Always visible */}
          <div className="flex items-center gap-2 lg:gap-4">
            <img 
              src={logo} 
              alt="FLY.TE Academy Logo" 
              className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
            <div className="hidden lg:flex items-center gap-2 text-[hsl(var(--admin-accent-foreground))]">
              <Compass className="h-5 w-5" />
              <span className="text-lg font-semibold">Administrator</span>
              <Badge variant="secondary" className="ml-2">Empower the Mission</Badge>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <div className="hidden lg:flex items-center gap-2">
            <NotificationBell />
            <RoleRequestButton />
            {isCoachAndAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/coach")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Target className="mr-2 h-4 w-4" />
                Coach View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
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
                className="text-[hsl(var(--admin-accent-foreground))] hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background z-50">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Administrator
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
                      navigate("/coach");
                    }}
                    className="w-full justify-start"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Coach View
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isSuperAdmin ? 'Global Analytics Dashboard' : `${primaryOrg?.organization.name || 'Organization'} Dashboard`}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'Monitor program health and leadership development across all organizations'
              : 'Monitor program health and leadership development for your organization'}
          </p>
        </div>

        {isFirstAdmin && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4" />
            <AlertTitle>System Administrator</AlertTitle>
            <AlertDescription>
              You are the first administrator of this system. Future admin requests will appear in the 
              System Management tab for your approval.
            </AlertDescription>
          </Alert>
        )}

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
            <TabsTrigger value="users">User Management</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="organizations">Organizations</TabsTrigger>}
            <TabsTrigger value="management">System Management</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
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

          <TabsContent value="users" className="space-y-6">
            <SectionErrorBoundary title="User Management Error">
              <UserManagementDashboard />
            </SectionErrorBoundary>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="organizations" className="space-y-6">
              <SectionErrorBoundary title="Organization Management Error">
                <OrganizationManagement />
              </SectionErrorBoundary>
            </TabsContent>
          )}

          <TabsContent value="management" className="space-y-6">
            <Tabs defaultValue="role-requests" className="space-y-6">
              <TabsList>
                <TabsTrigger value="role-requests">Role Requests</TabsTrigger>
                <TabsTrigger value="invitations">Invite Users</TabsTrigger>
                <TabsTrigger value="join-requests">Join Requests</TabsTrigger>
                <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              <TabsContent value="role-requests">
                <SectionErrorBoundary title="Role Requests Error">
                  <RoleRequestsManager />
                </SectionErrorBoundary>
              </TabsContent>

              <TabsContent value="invitations">
                <SectionErrorBoundary title="Invitations Error">
                  <InvitationManager />
                </SectionErrorBoundary>
              </TabsContent>

              <TabsContent value="join-requests">
                <SectionErrorBoundary title="Join Requests Error">
                  <JoinRequestsManager />
                </SectionErrorBoundary>
              </TabsContent>

              <TabsContent value="refunds">
                <SectionErrorBoundary title="Refund Requests Error">
                  <RefundRequestsManager />
                </SectionErrorBoundary>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      System Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setTeamManagementOpen(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Teams & Assignments
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setAnnouncementOpen(true)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Program Announcements
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <SectionErrorBoundary title="Performance Dashboard Error">
              <PerformanceDashboard />
            </SectionErrorBoundary>
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

      <TeamManagementDialog 
        open={teamManagementOpen} 
        onOpenChange={setTeamManagementOpen}
      />
      
      <AnnouncementDialog 
        open={announcementOpen} 
        onOpenChange={setAnnouncementOpen}
      />
    </div>
  );
}
