import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { ClipboardCheck, Target, CheckCircle2, Clock, PlayCircle, Flag, TrendingUp } from "lucide-react";

interface Assessment {
  id: string;
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

interface CoachAssessmentData {
  id: string;
  coach_id: string;
  timepoint: "pre" | "mid" | "end";
  composite_mean: number;
  leadership_dna_mean: number;
  excellence_mean: number;
  accountability_mean: number;
  discipline_mean: number;
  belonging_mean: number;
  classification: string;
  reflection_voluntary_followership: string | null;
  reflection_greatest_impact: string | null;
  reflection_growth_area: string | null;
  ai_insights: any | null;
  created_at: string;
}

interface Profile {
  first_name: string;
  last_name: string;
  sport: string;
}

interface Milestone {
  id: string;
  text: string;
  date: string;
}

interface Goal {
  goal: string;
  action_step: string;
  timeline: string;
  support_needed: string;
  status: "planned" | "in_progress" | "completed";
  domain?: string;
  progress?: number;
  milestones?: Milestone[];
}

interface AthleteDetailDrawerProps {
  athleteId: string;
  semester: string;
  open: boolean;
  onClose: () => void;
}

export function AthleteDetailDrawer({ athleteId, semester, open, onClose }: AthleteDetailDrawerProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Record<string, Assessment>>({});
  const [coachAssessments, setCoachAssessments] = useState<Record<string, CoachAssessmentData>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assessments");

  useEffect(() => {
    if (open && athleteId) {
      loadAthleteData();
    }
  }, [athleteId, semester, open]);

  const loadAthleteData = async () => {
    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, sport")
        .eq("id", athleteId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load student assessments for all timepoints
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", athleteId)
        .eq("semester_label", semester);

      if (assessmentsError) throw assessmentsError;

      const assessmentsByTimepoint: Record<string, Assessment> = {};
      assessmentsData?.forEach((assessment) => {
        assessmentsByTimepoint[assessment.timepoint] = assessment as Assessment;
      });
      setAssessments(assessmentsByTimepoint);

      // Load coach assessments for all timepoints
      const { data: coachData, error: coachError } = await supabase
        .from("coach_assessments")
        .select("*")
        .eq("athlete_id", athleteId)
        .eq("semester_label", semester);

      if (coachError) throw coachError;

      const coachAssessmentsByTimepoint: Record<string, CoachAssessmentData> = {};
      coachData?.forEach((ca) => {
        coachAssessmentsByTimepoint[ca.timepoint] = ca as CoachAssessmentData;
      });
      setCoachAssessments(coachAssessmentsByTimepoint);

      // Load growth plan goals
      const { data: growthPlan, error: growthError } = await supabase
        .from("growth_plans")
        .select("goals")
        .eq("user_id", athleteId)
        .eq("semester_label", semester)
        .maybeSingle();

      if (!growthError && growthPlan?.goals) {
        setGoals(growthPlan.goals as unknown as Goal[]);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error("Error loading athlete data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRadarData = (assessment: Assessment) => [
    { domain: "Leadership DNA", value: assessment.leadership_dna_mean || 0 },
    { domain: "Excellence", value: assessment.excellence_mean || 0 },
    { domain: "Accountability", value: assessment.accountability_mean || 0 },
    { domain: "Discipline", value: assessment.discipline_mean || 0 },
    { domain: "Belonging", value: assessment.belonging_mean || 0 },
  ];

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

  const canViewReflections = (assessment: Assessment) => {
    return !assessment.notes_private || !assessment.notes_private.includes("REFLECTIONS_PRIVATE=true");
  };

  const truncateText = (text: string, lines: number = 2) => {
    const lineHeight = 1.5;
    const maxHeight = lineHeight * lines;
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {profile?.first_name} {profile?.last_name}
              </SheetTitle>
              <SheetDescription>
                {profile?.sport} • {semester}
              </SheetDescription>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/coach/assess?athleteId=${athleteId}`)}
              className="flex items-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Assess Athlete
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Growth Plan
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Athlete's Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    This athlete hasn't set any goals yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal, index) => (
                      <div key={index} className="border border-border rounded-lg p-3 bg-card">
                        {goal.domain && (
                          <Badge variant="outline" className="mb-2 text-xs">
                            {goal.domain}
                          </Badge>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Progress
                            </span>
                            <span className="text-xs font-bold text-primary">{goal.progress || 0}%</span>
                          </div>
                          <Progress value={goal.progress || 0} className="h-2" />
                        </div>
                        
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{goal.goal || "Untitled goal"}</p>
                            {goal.action_step && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <strong>Action:</strong> {goal.action_step}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {goal.timeline && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {goal.timeline}
                                </span>
                              )}
                              {goal.support_needed && (
                                <span>Support: {goal.support_needed}</span>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={goal.status === "completed" ? "default" : "secondary"}
                            className={`text-xs ${
                              goal.status === "completed" 
                                ? "bg-green-500 text-white" 
                                : goal.status === "in_progress" 
                                ? "bg-blue-500 text-white" 
                                : ""
                            }`}
                          >
                            {goal.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {goal.status === "in_progress" && <PlayCircle className="h-3 w-3 mr-1" />}
                            {goal.status === "planned" ? "Planned" : goal.status === "in_progress" ? "In Progress" : "Completed"}
                          </Badge>
                        </div>
                        
                        {/* Milestones */}
                        {(goal.milestones || []).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                              <Flag className="h-3 w-3" />
                              Milestones ({goal.milestones?.length})
                            </p>
                            <div className="space-y-1">
                              {goal.milestones?.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                                  <span className="text-muted-foreground">
                                    {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                  <span>{milestone.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4">
            <Tabs defaultValue="pre">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pre">Pre</TabsTrigger>
                <TabsTrigger value="mid">Mid</TabsTrigger>
                <TabsTrigger value="end">End</TabsTrigger>
              </TabsList>

          {["pre", "mid", "end"].map((timepoint) => {
            const assessment = assessments[timepoint];
            const coachAssessment = coachAssessments[timepoint];
            
            if (!assessment) {
              return (
                <TabsContent key={timepoint} value={timepoint} className="space-y-4">
                  <p className="text-muted-foreground text-center py-8">No assessment data for this timepoint</p>
                </TabsContent>
              );
            }

            return (
              <TabsContent key={timepoint} value={timepoint} className="space-y-4">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Overview</span>
                      <Badge className={getClassificationColor(assessment.classification)}>
                        {assessment.classification}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-center mb-2">
                      {assessment.composite_mean.toFixed(2)}
                    </div>
                    <p className="text-center text-muted-foreground">Composite Score</p>
                  </CardContent>
                </Card>

                {/* AI Insights from Coach Assessment */}
                {coachAssessment?.ai_insights && (
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-lg">🤖 AI Leadership Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Overall Summary</h4>
                        <p className="text-sm">{coachAssessment.ai_insights.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">✓ Strengths</h4>
                        {coachAssessment.ai_insights.strengths?.map((strength: any, idx: number) => (
                          <div key={idx} className="mb-3 p-3 bg-green-50 rounded-lg">
                            <p className="font-medium text-sm">{strength.domain} ({strength.score.toFixed(2)}/5.0)</p>
                            <p className="text-sm text-muted-foreground mt-1">{strength.analysis}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">⚠️ Growth Areas</h4>
                        {coachAssessment.ai_insights.weaknesses?.map((weakness: any, idx: number) => (
                          <div key={idx} className="mb-3 p-3 bg-orange-50 rounded-lg">
                            <p className="font-medium text-sm">{weakness.domain} ({weakness.score.toFixed(2)}/5.0)</p>
                            <p className="text-sm text-muted-foreground mt-1">{weakness.analysis}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">🎯 Action Steps</h4>
                        {coachAssessment.ai_insights.actionable_steps?.map((step: any, idx: number) => (
                          <div key={idx} className="mb-2 p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">{step.title}</p>
                              <Badge variant={step.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                {step.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Target: {step.domain}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Domain Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Leadership DNA</span>
                      <span className="font-semibold">{assessment.leadership_dna_mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excellence</span>
                      <span className="font-semibold">{assessment.excellence_mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accountability</span>
                      <span className="font-semibold">{assessment.accountability_mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discipline</span>
                      <span className="font-semibold">{assessment.discipline_mean.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Belonging</span>
                      <span className="font-semibold">{assessment.belonging_mean.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Radar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={getRadarData(assessment)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" />
                        <PolarRadiusAxis domain={[0, 5]} />
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

                {/* Reflections */}
                {canViewReflections(assessment) && assessment.reflections && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Reflections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {assessment.reflections.habits_gap && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Habits Gap</p>
                          <p className="text-sm line-clamp-2">{assessment.reflections.habits_gap}</p>
                        </div>
                      )}
                      {assessment.reflections.lead_from_discomfort && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Lead from Discomfort
                          </p>
                          <p className="text-sm line-clamp-2">{assessment.reflections.lead_from_discomfort}</p>
                        </div>
                      )}
                      {assessment.reflections.who_challenges_you && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Who Challenges You</p>
                          <p className="text-sm line-clamp-2">{assessment.reflections.who_challenges_you}</p>
                        </div>
                      )}
                      {assessment.reflections.legacy && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Legacy</p>
                          <p className="text-sm line-clamp-2">{assessment.reflections.legacy}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              );
            })}
            </Tabs>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
