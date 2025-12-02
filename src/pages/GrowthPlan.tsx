import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Save, Download, Lightbulb, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/flyte-academy-logo.png";
import { Skeleton } from "@/components/ui/skeleton";

interface Goal {
  goal: string;
  action_step: string;
  timeline: string;
  support_needed: string;
  status: "planned" | "in_progress" | "completed";
  domain?: string;
}

const GrowthPlan = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const semesterParam = searchParams.get("semester");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [growthPlan, setGrowthPlan] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [semesterLabel, setSemesterLabel] = useState("");
  const [suggestedInsights, setSuggestedInsights] = useState<any[]>([]);

  // Default suggested goals if no assessment insights exist
  const defaultSuggestedGoals = [
    {
      domain: "Leadership DNA",
      message: "Take initiative in team situations by volunteering for leadership roles or speaking up during team discussions.",
      action: "Volunteer to lead one practice drill or team activity this week."
    },
    {
      domain: "Accountability",
      message: "Own your mistakes and learn from setbacks instead of making excuses or blaming others.",
      action: "After each practice, identify one thing you could have done better and write it down."
    },
    {
      domain: "Excellence",
      message: "Push yourself beyond minimum expectations by setting higher personal standards in training.",
      action: "Add 15 extra minutes of focused skill work to your daily routine."
    },
    {
      domain: "Discipline",
      message: "Build consistent daily habits that support your athletic and leadership development.",
      action: "Create a morning routine that includes visualization, goal review, and physical preparation."
    },
    {
      domain: "Belonging",
      message: "Strengthen team bonds by actively supporting and encouraging your teammates.",
      action: "Give three specific compliments or words of encouragement to teammates each practice."
    }
  ];

  useEffect(() => {
    fetchGrowthPlan();
  }, [semesterParam]);

  const fetchGrowthPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Determine semester label
      let semester = semesterParam;
      if (!semester) {
        // Fetch from latest assessment
        const { data: latestAssessment } = await supabase
          .from("assessments")
          .select("semester_label")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        semester = latestAssessment?.semester_label || "Current Semester";
      }
      setSemesterLabel(semester);

      // Fetch or create growth plan
      const { data: existingPlan, error } = await supabase
        .from("growth_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("semester_label", semester)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (existingPlan) {
        setGrowthPlan(existingPlan);
        setGoals((existingPlan.goals as unknown as Goal[]) || []);
      } else {
        // Create new plan
        const { data: newPlan, error: insertError } = await supabase
          .from("growth_plans")
          .insert({
            user_id: user.id,
            semester_label: semester,
            goals: [],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setGrowthPlan(newPlan);
        setGoals([]);
      }

      // Fetch suggested insights from latest assessment
      const { data: latestAssessment } = await supabase
        .from("assessments")
        .select("coaching_insights")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestAssessment?.coaching_insights) {
        setSuggestedInsights(latestAssessment.coaching_insights as unknown as any[]);
      }
    } catch (error) {
      console.error("Error fetching growth plan:", error);
      toast({
        title: "Error",
        description: "Failed to load growth plan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        goal: "",
        action_step: "",
        timeline: "4 weeks",
        support_needed: "",
        status: "planned",
      },
    ]);
  };

  const addSuggestedGoal = (insight: any) => {
    const newGoal: Goal = {
      goal: insight.message,
      action_step: insight.action,
      timeline: "4 weeks",
      support_needed: "Coach/teammate",
      status: "planned",
      domain: insight.domain,
    };
    setGoals([...goals, newGoal]);
    toast({
      title: "Goal added",
      description: `Added ${insight.domain} goal to your plan.`,
    });
  };

  const updateGoal = (index: number, field: keyof Goal, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const saveGoals = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("growth_plans")
        .update({ goals: goals as unknown as any })
        .eq("id", growthPlan.id);

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Your growth plan has been updated.",
      });
    } catch (error) {
      console.error("Error saving goals:", error);
      toast({
        title: "Error",
        description: "Failed to save growth plan.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportPDF = () => {
    // Simple print functionality - opens browser print dialog
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your growth plan...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <img src={logo} alt="Flyte Academy" className="h-10" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border print:hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img 
              src={logo} 
              alt="FLY.TE Academy" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
            <Button variant="outline" onClick={() => navigate("/results")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Results
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Leadership Growth Plan</h1>
          <p className="text-muted-foreground">{semesterLabel}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Goals Table */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between print:pb-4">
                <div>
                  <CardTitle>My Goals</CardTitle>
                  <CardDescription>Track your leadership development journey</CardDescription>
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button onClick={addGoal} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                  <Button onClick={saveGoals} disabled={saving} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No goals yet. Add your first goal to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-card print:break-inside-avoid">
                        {goal.domain && (
                          <div className="text-xs text-primary font-semibold">{goal.domain}</div>
                        )}
                        <div className="grid gap-3">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Goal</label>
                            <Input
                              value={goal.goal}
                              onChange={(e) => updateGoal(index, "goal", e.target.value)}
                              placeholder="What do you want to achieve?"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Action Step</label>
                            <Input
                              value={goal.action_step}
                              onChange={(e) => updateGoal(index, "action_step", e.target.value)}
                              placeholder="How will you achieve it?"
                              className="mt-1"
                            />
                          </div>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                              <Input
                                value={goal.timeline}
                                onChange={(e) => updateGoal(index, "timeline", e.target.value)}
                                placeholder="4 weeks"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Support Needed</label>
                              <Input
                                value={goal.support_needed}
                                onChange={(e) => updateGoal(index, "support_needed", e.target.value)}
                                placeholder="Coach, teammate"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Status</label>
                              <Select
                                value={goal.status}
                                onValueChange={(value) => updateGoal(index, "status", value as any)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planned">Planned</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoal(index)}
                          className="text-destructive hover:text-destructive print:hidden"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggested Insights Panel */}
          <div className="lg:col-span-1 print:hidden">
            <Card className="shadow-card sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Suggested Goals
                </CardTitle>
                <CardDescription>From your latest assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Show assessment insights first if available */}
                {suggestedInsights.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-primary mb-2">From Your Assessment</p>
                    {suggestedInsights.map((insight, index) => (
                      <div key={`insight-${index}`} className="border border-primary/30 rounded-lg p-3 bg-primary/5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-sm font-semibold text-foreground">{insight.domain}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addSuggestedGoal(insight)}
                            className="h-6 px-2 text-xs hover:bg-primary/10"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{insight.message}</p>
                        <p className="text-xs text-foreground">
                          <strong>Action:</strong> {insight.action}
                        </p>
                      </div>
                    ))}
                  </>
                )}
                
                {/* Always show default suggested goals */}
                <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">
                  {suggestedInsights.length > 0 ? "More Goal Ideas" : "Suggested Goals"}
                </p>
                {defaultSuggestedGoals.map((goal, index) => (
                  <div key={`default-${index}`} className="border border-border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground">{goal.domain}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addSuggestedGoal(goal)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{goal.message}</p>
                    <p className="text-xs text-foreground">
                      <strong>Action:</strong> {goal.action}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 print:hidden">
          <Button size="lg" variant="outline" onClick={exportPDF}>
            <Download className="mr-2 h-5 w-5" />
            Export PDF Summary
          </Button>
          <Button size="lg" onClick={() => navigate("/results")}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Results
          </Button>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:pb-4 {
            padding-bottom: 1rem !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default GrowthPlan;
