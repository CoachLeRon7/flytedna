import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Target, Plus, BookOpen } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/flyte-academy-logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartSkeleton, TableSkeleton } from "@/components/ui/skeleton-components";
import { PeerFeedbackSection } from "@/components/student/PeerFeedbackSection";
import { DomainBreakdownTable } from "@/components/student/DomainBreakdownTable";
import { DomainExplanationCard } from "@/components/student/DomainExplanationCard";
import { TrendAnalysisCard } from "@/components/student/TrendAnalysisCard";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const assessmentId = searchParams.get("assessment_id");
  const [assessment, setAssessment] = useState<any>(null);
  const [previousAssessment, setPreviousAssessment] = useState<any>(null);
  const [peerFeedback, setPeerFeedback] = useState<any>(null);
  const [coachFeedback, setCoachFeedback] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [loading, setLoading] = useState(true);
  const [shareReflections, setShareReflections] = useState(true);
  const [addingToGrowthPlan, setAddingToGrowthPlan] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [developmentalStage, setDevelopmentalStage] = useState<string>("");

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

        // Fetch user role
        const { data: roleData } = await supabase
          .rpc("get_user_role", { _user_id: user.id });
        if (roleData) {
          setUserRole(roleData);
        }

        // Fetch previous assessment for trend analysis
        const { data: prevAssessment } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", data.user_id)
          .eq("semester_label", data.semester_label)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (prevAssessment) {
          setPreviousAssessment(prevAssessment);
        }

        // Fetch peer feedback aggregated data
        const { data: peerData } = await supabase
          .from("peer_feedback_aggregated")
          .select("*")
          .eq("assessed_user_id", data.user_id)
          .eq("timepoint", data.timepoint)
          .eq("semester_label", data.semester_label)
          .maybeSingle();
        
        if (peerData) {
          setPeerFeedback(peerData);
        }

        // Fetch coach assessment
        const { data: coachData } = await supabase
          .from("coach_assessments")
          .select("*")
          .eq("athlete_id", data.user_id)
          .eq("timepoint", data.timepoint)
          .eq("semester_label", data.semester_label)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (coachData) {
          setCoachFeedback(coachData);
        }

        // Fetch user's age and determine developmental stage
        const { data: profile } = await supabase
          .from('profiles')
          .select('date_of_birth')
          .eq('id', data.user_id)
          .single();
        
        if (profile?.date_of_birth) {
          const birthDate = new Date(profile.date_of_birth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          setUserAge(age);
          
          // Determine developmental stage
          if (age < 15) {
            setDevelopmentalStage("Self-Awareness & Accountability (Ages 12-15)");
          } else if (age < 17) {
            setDevelopmentalStage("Team Influence & Communication (Ages 15-17)");
          } else if (age < 19) {
            setDevelopmentalStage("Confidence & Initiative (Ages 17-19)");
          } else {
            setDevelopmentalStage("Culture & Trust-Building (Ages 19+)");
          }
        }
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
        const currentGoals = (existingPlan.goals as unknown as any[]) || [];
        const { error } = await supabase
          .from("growth_plans")
          .update({ goals: [...currentGoals, newGoal] as unknown as any })
          .eq("id", existingPlan.id);
        
        if (error) throw error;
      } else {
        // Create new growth plan
        const { error } = await supabase
          .from("growth_plans")
          .insert({
            user_id: user.id,
            semester_label: assessment.semester_label,
            goals: [newGoal] as unknown as any,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
              <CardContent>
                <ChartSkeleton />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <TableSkeleton rows={5} columns={6} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

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
            <img 
              src={logo} 
              alt="FLY.TE Academy" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
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

        {/* Developmental Stage Card */}
        {userAge && (
          <Card className="mb-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Target className="h-5 w-5" />
                Your Developmental Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>{developmentalStage}</strong>
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Leadership grows with experience. Your classification reflects where you are 
                in your leadership journey, relative to your age and development stage. 
                {userAge < 19 && " As you mature, higher classifications will become available."}
              </p>
              {assessment.composite_mean >= 4.6 && assessment.classification !== 'Transformational' && (
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-3 italic">
                  Your scores show strong leadership potential. Continue developing these skills, 
                  and your classification will reflect your growth as you gain more experience.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Left: Composite Score Card with 360° Breakdown */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>360° Composite Score</CardTitle>
              <CardDescription>Integrated self, peer, and coach assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-4">
                  {assessment.final_composite_mean?.toFixed(2) || assessment.composite_mean?.toFixed(2) || "N/A"}
                </div>
                <Badge className={`${getClassificationColor(assessment.classification)} text-lg px-4 py-2`}>
                  {assessment.classification || "Processing..."}
                </Badge>
                <p className="text-sm text-muted-foreground mt-4">out of 5.0</p>
              </div>
              
              {/* Score Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Score Components:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Self-Assessment (60%)</span>
                    <span className="font-semibold">{assessment.composite_mean?.toFixed(2)}</span>
                  </div>
                  {assessment.peer_adjusted_composite && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peer Feedback (15%)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{assessment.peer_adjusted_composite.toFixed(2)}</span>
                        {assessment.peer_modifier !== 0 && (
                          <span className={`text-xs ${assessment.peer_modifier > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {assessment.peer_modifier > 0 ? '+' : ''}{assessment.peer_modifier.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {assessment.coach_adjusted_composite && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Coach Assessment (25%)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{assessment.coach_adjusted_composite.toFixed(2)}</span>
                        {assessment.coach_modifier !== 0 && (
                          <span className={`text-xs ${assessment.coach_modifier > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {assessment.coach_modifier > 0 ? '+' : ''}{assessment.coach_modifier.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {(!assessment.peer_adjusted_composite && !assessment.coach_adjusted_composite) && (
                  <p className="text-xs text-muted-foreground italic">
                    Your score will be adjusted when peer and coach assessments are completed.
                  </p>
                )}
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

        {/* Domain Breakdown Table - Role-based visibility */}
        {(userRole === "coach" || userRole === "admin") && (
          <div className="mb-8">
            <DomainBreakdownTable
              scores={[
                {
                  domain: "leadership_dna",
                  label: "Leadership DNA",
                  self: assessment.leadership_dna_mean || 0,
                  peer: peerFeedback?.avg_leadership_dna,
                  coach: coachFeedback?.leadership_dna_mean,
                  final: assessment.final_composite_mean || assessment.leadership_dna_mean || 0,
                },
                {
                  domain: "excellence",
                  label: "Excellence",
                  self: assessment.excellence_mean || 0,
                  peer: peerFeedback?.avg_excellence,
                  coach: coachFeedback?.excellence_mean,
                  final: assessment.final_composite_mean || assessment.excellence_mean || 0,
                },
                {
                  domain: "accountability",
                  label: "Accountability",
                  self: assessment.accountability_mean || 0,
                  peer: peerFeedback?.avg_accountability,
                  coach: coachFeedback?.accountability_mean,
                  final: assessment.final_composite_mean || assessment.accountability_mean || 0,
                },
                {
                  domain: "discipline",
                  label: "Discipline",
                  self: assessment.discipline_mean || 0,
                  peer: peerFeedback?.avg_discipline,
                  coach: coachFeedback?.discipline_mean,
                  final: assessment.final_composite_mean || assessment.discipline_mean || 0,
                },
                {
                  domain: "belonging",
                  label: "Belonging & Impact",
                  self: assessment.belonging_mean || 0,
                  peer: peerFeedback?.avg_belonging,
                  coach: coachFeedback?.belonging_mean,
                  final: assessment.final_composite_mean || assessment.belonging_mean || 0,
                },
              ]}
              userRole={userRole}
            />
          </div>
        )}

        {/* Understanding Your Scores */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Understanding Your Scores
            </CardTitle>
            <CardDescription>
              What each leadership domain means and how to interpret your results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DomainExplanationCard
              explanation={{
                domain: "leadership_dna",
                label: "Leadership DNA",
                score: assessment.leadership_dna_mean || 0,
                description: "Your foundational leadership identity - how you see yourself as a leader and inspire others through vision and influence.",
                sampleQuestions: [
                  "I have a clear vision for my team's future",
                  "Others naturally look to me for direction",
                  "I inspire teammates through my actions"
                ],
                interpretation: assessment.leadership_dna_mean >= 4.0 
                  ? "You demonstrate strong leadership identity and vision. You're seen as a natural leader who inspires and guides others."
                  : assessment.leadership_dna_mean >= 3.0
                  ? "You're developing your leadership identity. Continue building confidence in your vision and influence."
                  : "Focus on clarifying your leadership vision and practicing influence skills. Seek mentorship from established leaders.",
                coachingTips: [
                  "Create opportunities for athlete to lead team meetings or practice sessions",
                  "Help them articulate their personal leadership philosophy",
                  "Provide feedback on how their actions inspire (or don't inspire) teammates"
                ],
                riskFlag: assessment.leadership_dna_mean < 3.0,
              }}
              showCoachingTips={userRole === "coach" || userRole === "admin"}
            />
            
            <DomainExplanationCard
              explanation={{
                domain: "excellence",
                label: "Excellence",
                score: assessment.excellence_mean || 0,
                description: "Your commitment to high standards, continuous improvement, and delivering quality performance consistently.",
                sampleQuestions: [
                  "I consistently strive to improve my skills",
                  "I hold myself to high standards in everything I do",
                  "I seek feedback to enhance my performance"
                ],
                interpretation: assessment.excellence_mean >= 4.0
                  ? "You maintain exceptional standards and continuously push for improvement. Your commitment to excellence is evident."
                  : assessment.excellence_mean >= 3.0
                  ? "You demonstrate good commitment to quality and growth. Continue seeking ways to elevate your performance."
                  : "Develop more consistent standards and seek regular feedback. Excellence requires daily commitment to improvement.",
                coachingTips: [
                  "Set specific, measurable performance goals together",
                  "Create a feedback loop with regular check-ins",
                  "Celebrate small wins while maintaining high expectations"
                ],
                riskFlag: assessment.excellence_mean < 3.0,
              }}
              showCoachingTips={userRole === "coach" || userRole === "admin"}
            />
            
            <DomainExplanationCard
              explanation={{
                domain: "accountability",
                label: "Accountability",
                score: assessment.accountability_mean || 0,
                description: "Taking ownership of commitments, being reliable, and holding yourself and others to agreed-upon standards.",
                sampleQuestions: [
                  "I follow through on my commitments consistently",
                  "I take responsibility for my mistakes",
                  "I hold teammates accountable in constructive ways"
                ],
                interpretation: assessment.accountability_mean >= 4.0
                  ? "You excel at taking ownership and following through. Teammates can depend on you to deliver on your promises."
                  : assessment.accountability_mean >= 3.0
                  ? "You generally follow through on commitments. Work on consistency and proactively addressing shortfalls."
                  : "Focus on reliability and ownership. Start with small commitments and build a track record of follow-through.",
                coachingTips: [
                  "Use specific examples of when they did/didn't follow through",
                  "Create accountability partnerships with teammates",
                  "Teach them to anticipate obstacles and communicate proactively"
                ],
                riskFlag: assessment.accountability_mean < 3.0,
              }}
              showCoachingTips={userRole === "coach" || userRole === "admin"}
            />
            
            <DomainExplanationCard
              explanation={{
                domain: "discipline",
                label: "Discipline",
                score: assessment.discipline_mean || 0,
                description: "Consistent routines, self-control, and the ability to delay gratification for long-term goals.",
                sampleQuestions: [
                  "I maintain consistent daily routines",
                  "I resist distractions to stay focused on goals",
                  "I manage my time effectively"
                ],
                interpretation: assessment.discipline_mean >= 4.0
                  ? "You demonstrate exceptional self-control and consistency. Your routines and focus drive sustained performance."
                  : assessment.discipline_mean >= 3.0
                  ? "You have good foundational discipline. Continue building consistent habits and managing distractions."
                  : "Work on establishing basic routines and time management. Discipline is built through small daily choices.",
                coachingTips: [
                  "Help them design a sustainable daily routine",
                  "Identify and address specific sources of distraction",
                  "Track progress on discipline-related behaviors weekly"
                ],
                riskFlag: assessment.discipline_mean < 3.0,
              }}
              showCoachingTips={userRole === "coach" || userRole === "admin"}
            />
            
            <DomainExplanationCard
              explanation={{
                domain: "belonging",
                label: "Belonging & Impact",
                score: assessment.belonging_mean || 0,
                description: "Creating inclusive environments, building strong relationships, and making others feel valued and connected.",
                sampleQuestions: [
                  "I actively include others and make them feel valued",
                  "I build strong relationships across the team",
                  "I create a positive team culture"
                ],
                interpretation: assessment.belonging_mean >= 4.0
                  ? "You excel at creating inclusive environments and building connections. Your presence strengthens team cohesion."
                  : assessment.belonging_mean >= 3.0
                  ? "You contribute to team culture positively. Continue being intentional about inclusion and relationship-building."
                  : "Focus on actively including others and strengthening connections. Small gestures of recognition go a long way.",
                coachingTips: [
                  "Assign them as a buddy/mentor for new team members",
                  "Highlight specific moments when they made others feel included",
                  "Encourage them to initiate team-building activities"
                ],
                riskFlag: assessment.belonging_mean < 3.0,
              }}
              showCoachingTips={userRole === "coach" || userRole === "admin"}
            />
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        {previousAssessment && (
          <div className="mb-8">
            <TrendAnalysisCard
              current={{
                timepoint: assessment.timepoint,
                composite: assessment.final_composite_mean || assessment.composite_mean,
                leadership_dna: assessment.leadership_dna_mean,
                excellence: assessment.excellence_mean,
                accountability: assessment.accountability_mean,
                discipline: assessment.discipline_mean,
                belonging: assessment.belonging_mean,
                classification: assessment.classification,
              }}
              previous={{
                timepoint: previousAssessment.timepoint,
                composite: previousAssessment.final_composite_mean || previousAssessment.composite_mean,
                leadership_dna: previousAssessment.leadership_dna_mean,
                excellence: previousAssessment.excellence_mean,
                accountability: previousAssessment.accountability_mean,
                discipline: previousAssessment.discipline_mean,
                belonging: previousAssessment.belonging_mean,
                classification: previousAssessment.classification,
              }}
            />
          </div>
        )}

        {/* Student Reflections & Journal */}
        {assessment.reflections && Object.keys(assessment.reflections).length > 0 && (
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Your Reflections & Journal
              </CardTitle>
              <CardDescription>Your personal reflections on your leadership journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assessment.reflections.habits_gap && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Leadership Habits & Behaviors</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {assessment.reflections.habits_gap}
                  </p>
                </div>
              )}
              {assessment.reflections.excellence_support && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Excellence & Support Systems</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {assessment.reflections.excellence_support}
                  </p>
                </div>
              )}
              {assessment.reflections.growth_commitment && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Growth & Commitment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {assessment.reflections.growth_commitment}
                  </p>
                </div>
              )}
              {assessment.reflections.team_impact && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Team Impact & Contribution</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {assessment.reflections.team_impact}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

        {/* Peer Feedback Section */}
        <div className="mb-8">
          <PeerFeedbackSection 
            userId={assessment.user_id}
            timepoint={assessment.timepoint}
            semesterLabel={assessment.semester_label}
            selfScores={{
              leadership_dna_mean: assessment.leadership_dna_mean,
              excellence_mean: assessment.excellence_mean,
              accountability_mean: assessment.accountability_mean,
              discipline_mean: assessment.discipline_mean,
              belonging_mean: assessment.belonging_mean,
              composite_mean: assessment.composite_mean,
            }}
          />
        </div>

        {/* Coach Assessment & AI Insights */}
        {coachFeedback && shareReflections && (
          <Card className="mb-8 shadow-card border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Coach's Assessment & Recommendations
              </CardTitle>
              <CardDescription>
                Your coach's evaluation and AI-powered development insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Coach's Score */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Coach's Composite Score</span>
                  <span className="text-2xl font-bold text-primary">{coachFeedback.composite_mean.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on observed behaviors during {assessment.timepoint === "pre" ? "Pre-Season" : assessment.timepoint === "mid" ? "Mid-Season" : "Post-Season"}
                </p>
              </div>

              {/* Coach's Reflections */}
              {(coachFeedback.reflection_voluntary_followership || 
                coachFeedback.reflection_greatest_impact || 
                coachFeedback.reflection_growth_area) && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Coach's Observations</h4>
                  {coachFeedback.reflection_voluntary_followership && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Voluntary Followership
                      </p>
                      <p className="text-sm">{coachFeedback.reflection_voluntary_followership}</p>
                    </div>
                  )}
                  {coachFeedback.reflection_greatest_impact && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Greatest Impact Moment
                      </p>
                      <p className="text-sm">{coachFeedback.reflection_greatest_impact}</p>
                    </div>
                  )}
                  {coachFeedback.reflection_growth_area && (
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Key Growth Area
                      </p>
                      <p className="text-sm">{coachFeedback.reflection_growth_area}</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI-Generated Insights */}
              {coachFeedback.ai_insights && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-semibold">🤖 AI Leadership Analysis</span>
                    <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="font-semibold mb-2">Overall Leadership Profile</h4>
                    <p className="text-sm">{coachFeedback.ai_insights.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-green-600 flex items-center gap-2">
                      <span>✓</span> Your Leadership Strengths
                    </h4>
                    {coachFeedback.ai_insights.strengths?.map((strength: any, idx: number) => (
                      <div key={idx} className="mb-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-sm mb-1">
                          {strength.domain} <span className="text-green-700">({strength.score.toFixed(2)}/5.0)</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{strength.analysis}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600 flex items-center gap-2">
                      <span>⚠️</span> Areas for Growth
                    </h4>
                    {coachFeedback.ai_insights.weaknesses?.map((weakness: any, idx: number) => (
                      <div key={idx} className="mb-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="font-medium text-sm mb-1">
                          {weakness.domain} <span className="text-orange-700">({weakness.score.toFixed(2)}/5.0)</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{weakness.analysis}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span>🎯</span> Your Action Plan
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Start with these specific steps to accelerate your development:
                    </p>
                    {coachFeedback.ai_insights.actionable_steps?.map((step: any, idx: number) => (
                      <div key={idx} className="mb-3 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm flex-1">{step.title}</p>
                          <Badge 
                            variant={step.priority === 'high' ? 'destructive' : step.priority === 'medium' ? 'default' : 'secondary'} 
                            className="text-xs ml-2"
                          >
                            {step.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            Target: {step.domain}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
