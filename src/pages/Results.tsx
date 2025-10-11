import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, Plus } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/flyte-academy-logo.png";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessmentId = searchParams.get("assessment_id");
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shareReflections, setShareReflections] = useState(true);
  const [addingToGrowthPlan, setAddingToGrowthPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) {
      navigate("/dashboard");
      return;
    }

    const fetchAssessment = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        let data, error;
        
        if (assessmentId) {
          // Fetch specific assessment
          const result = await supabase
            .from("assessments")
            .select("*")
            .eq("id", assessmentId)
            .single();
          data = result.data;
          error = result.error;
        } else {
          // Fetch latest transformational assessment
          const result = await supabase
            .from("assessments")
            .select("*")
            .eq("user_id", user.id)
            .eq("edition", "transformational")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          data = result.data;
          error = result.error;
        }

        if (error) throw error;
        if (!data) {
          toast({
            title: "No assessment found",
            description: "Please complete an assessment first.",
            variant: "destructive",
          });
          navigate("/assessment");
          return;
        }
        
        setAssessment(data);
        setShareReflections(data.notes_private !== "REFLECTIONS_PRIVATE=true");
      } catch (error) {
        console.error("Error fetching assessment:", error);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const handleShareToggle = async (checked: boolean) => {
    setShareReflections(checked);
    try {
      const { error } = await supabase
        .from("assessments")
        .update({ notes_private: checked ? null : "REFLECTIONS_PRIVATE=true" })
        .eq("id", assessment.id);
      
      if (error) throw error;
      
      toast({
        title: checked ? "Reflections shared" : "Reflections private",
        description: checked 
          ? "Your coach can now view your reflections." 
          : "Your reflections are now private.",
      });
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    }
  };

  const addToGrowthPlan = async (insight: any) => {
    setAddingToGrowthPlan(insight.domain);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if growth plan exists for this semester
      const { data: existingPlan } = await supabase
        .from("growth_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester_label", assessment.semester_label)
        .maybeSingle();

      const newGoal = {
        goal: insight.message,
        action_step: insight.action,
        timeline: "4 weeks",
        support_needed: "Coach/teammate",
        status: "planned",
        domain: insight.domain,
      };

      if (existingPlan) {
        // Append to existing goals
        const currentGoals = (existingPlan.goals as any[]) || [];
        const { error } = await supabase
          .from("growth_plans")
          .update({ goals: [...currentGoals, newGoal] })
          .eq("id", existingPlan.id);
        
        if (error) throw error;
      } else {
        // Create new growth plan
        const { error } = await supabase
          .from("growth_plans")
          .insert({
            user_id: user.id,
            semester_label: assessment.semester_label,
            goals: [newGoal],
          });
        
        if (error) throw error;
      }

      toast({
        title: "Added to Growth Plan",
        description: `${insight.domain} goal added successfully.`,
      });
    } catch (error) {
      console.error("Error adding to growth plan:", error);
      toast({
        title: "Error",
        description: "Failed to add goal to growth plan.",
        variant: "destructive",
      });
    } finally {
      setAddingToGrowthPlan(null);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "Transformational":
        return "bg-[hsl(var(--transformational))] text-[hsl(var(--transformational-foreground))]";
      case "Emerging":
        return "bg-[hsl(var(--emerging))] text-[hsl(var(--emerging-foreground))]";
      case "Developing":
        return "bg-[hsl(var(--developing))] text-[hsl(var(--developing-foreground))]";
      case "Foundational":
        return "bg-[hsl(var(--foundational))] text-[hsl(var(--foundational-foreground))]";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const radarData = [
    { domain: "Leadership DNA", value: assessment.leadership_dna_mean || 0 },
    { domain: "Excellence", value: assessment.excellence_mean || 0 },
    { domain: "Accountability", value: assessment.accountability_mean || 0 },
    { domain: "Discipline", value: assessment.discipline_mean || 0 },
    { domain: "Belonging & Impact", value: assessment.belonging_mean || 0 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={logo} alt="FLY.TE Academy" className="h-12 w-auto" />
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Your Leadership Summary</h1>
          <p className="text-muted-foreground">
            {assessment.semester_label} - {assessment.timepoint} Assessment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Composite Score Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Composite Score</CardTitle>
              <CardDescription>Overall leadership development score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">
                  {assessment.composite_mean?.toFixed(2) || "N/A"}
                </div>
                <Badge className={`${getClassificationColor(assessment.classification)} text-lg px-4 py-2`}>
                  {assessment.classification || "Processing..."}
                </Badge>
                <p className="text-sm text-muted-foreground mt-4">out of 5.0</p>
              </div>
            </CardContent>
          </Card>

          {/* Right: Radar Chart */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Domain Profile</CardTitle>
              <CardDescription>Performance across five leadership domains</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="domain" 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 5]} 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        {assessment.coaching_insights && assessment.coaching_insights.length > 0 && (
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Coaching Insights
              </CardTitle>
              <CardDescription>Personalized recommendations for growth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.coaching_insights.map((insight: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">{insight.domain}</span>
                        <Badge variant={insight.level === "critical" ? "destructive" : "secondary"}>
                          {insight.level}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{insight.message}</p>
                      <p className="text-sm text-foreground">
                        <strong>Action:</strong> {insight.action}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToGrowthPlan(insight)}
                      disabled={addingToGrowthPlan === insight.domain}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Growth Plan
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Privacy Toggle */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control what your coach can see</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-reflections" className="text-base">
                  Share reflections with coach?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow your coach to view your personal reflections
                </p>
              </div>
              <Switch
                id="share-reflections"
                checked={shareReflections}
                onCheckedChange={handleShareToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg"
            onClick={() => navigate(`/growth-plan?semester=${encodeURIComponent(assessment.semester_label)}`)}
          >
            <Target className="mr-2 h-5 w-5" />
            View Growth Plan
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate("/assessment")}
          >
            Retake at Mid-Semester
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;
