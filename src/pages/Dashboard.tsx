import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@supabase/supabase-js";
import { FileText, TrendingUp, Target, LogOut, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/flyte-academy-logo.png";
import { LeadershipSnapshot } from "@/components/student/LeadershipSnapshot";
import { NudgesList } from "@/components/student/NudgesList";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [latestAssessment, setLatestAssessment] = useState<any>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ assessmentsCompleted: 0, activeGoals: 0 });

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        // Redirect coaches and admins to appropriate dashboard
        const role = session.user?.user_metadata?.role || "student";
        if (role === "coach") {
          navigate("/coach");
          return;
        } else if (role === "admin") {
          navigate("/admin");
          return;
        }
        
        // Load student data
        await loadStudentData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else {
          const role = session.user?.user_metadata?.role || "student";
          if (role === "coach") {
            navigate("/coach");
          } else if (role === "admin") {
            navigate("/admin");
          } else {
            await loadStudentData(session.user.id);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStudentData = async (userId: string) => {
    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(profileData);

    // Load assessments
    const { data: assessments } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (assessments && assessments.length > 0) {
      setLatestAssessment(assessments[0]);
      setAssessmentHistory(assessments);
      setStats(prev => ({ ...prev, assessmentsCompleted: assessments.length }));
    }

    // Load growth plans
    const { data: growthPlans } = await supabase
      .from("growth_plans")
      .select("*")
      .eq("user_id", userId);

    if (growthPlans && growthPlans.length > 0) {
      const totalGoals = growthPlans.reduce((sum, plan) => 
        sum + (Array.isArray(plan.goals) ? plan.goals.length : 0), 0
      );
      setStats(prev => ({ ...prev, activeGoals: totalGoals }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const userMetadata = user?.user_metadata;
  const firstName = userMetadata?.first_name || "Student";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with Student Branding */}
      <header className="bg-[hsl(var(--student-accent))] border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={logo} alt="FLY.TE Academy Logo" className="h-12 w-auto" />
            <div className="flex items-center gap-2 text-white">
              <UserIcon className="h-5 w-5" />
              <span className="text-lg font-semibold">Student-Athlete</span>
              <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/40">Own Your Growth</Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Summary */}
        <Card className="mb-8 shadow-card border-l-4 border-l-[hsl(var(--student-accent))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏁 Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{profile?.first_name} {profile?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sport</p>
                <p className="font-semibold">{profile?.sport || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="font-semibold">{latestAssessment?.classification || "Not assessed"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Composite Score</p>
                <p className="font-semibold text-[hsl(var(--student-accent))]">
                  {latestAssessment?.composite_mean?.toFixed(2) || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Snapshot */}
        <div className="mb-8">
          <LeadershipSnapshot 
            latestAssessment={latestAssessment} 
            assessmentHistory={assessmentHistory}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer" onClick={() => navigate("/assessment")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-[hsl(var(--student-accent))]/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-[hsl(var(--student-accent))]" />
              </div>
              <CardTitle>Take Assessment</CardTitle>
              <CardDescription>
                Complete your FLDI evaluation for this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-[hsl(var(--student-accent))] hover:bg-[hsl(var(--student-accent))]/90">
                Start Assessment
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer" onClick={() => navigate("/results")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>🧠 My Reflections & Results</CardTitle>
              <CardDescription>
                View your scores, progress, and journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                View Results
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer" onClick={() => navigate("/growth-plan")}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-success" />
              </div>
              <CardTitle>🎯 Growth Plan</CardTitle>
              <CardDescription>
                Set and track your leadership development goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Manage Goals
              </Button>
            </CardContent>
          </Card>

          {/* Nudges */}
          {user && <NudgesList userId={user.id} />}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Assessments Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-[hsl(var(--student-accent))]">{stats.assessmentsCompleted}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.assessmentsCompleted === 0 ? "Complete your first assessment to get started" : "Keep tracking your progress"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Current Classification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[hsl(var(--student-accent))]">
                {latestAssessment?.classification || "Not assessed"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {latestAssessment ? "Your current leadership level" : "Take an assessment to see your leadership level"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-success">{stats.activeGoals}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.activeGoals === 0 ? "Create your first growth plan" : "Goals you're working towards"}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;