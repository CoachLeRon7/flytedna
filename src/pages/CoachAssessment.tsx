import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CoachAssessmentDomainSection } from "@/components/coach/CoachAssessmentDomainSection";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

const coachAssessmentSchema = z.object({
  // Domain responses (15 total, 3 per domain)
  L1: z.number().min(1).max(5),
  L2: z.number().min(1).max(5),
  L3: z.number().min(1).max(5),
  E1: z.number().min(1).max(5),
  E2: z.number().min(1).max(5),
  E3: z.number().min(1).max(5),
  A1: z.number().min(1).max(5),
  A2: z.number().min(1).max(5),
  A3: z.number().min(1).max(5),
  D1: z.number().min(1).max(5),
  D2: z.number().min(1).max(5),
  D3: z.number().min(1).max(5),
  B1: z.number().min(1).max(5),
  B2: z.number().min(1).max(5),
  B3: z.number().min(1).max(5),
  // Reflection prompts
  reflection_voluntary_followership: z.string().optional(),
  reflection_greatest_impact: z.string().optional(),
  reflection_growth_area: z.string().optional(),
  // Assessment metadata
  semester_label: z.string().min(1, "Semester is required"),
  timepoint: z.enum(["pre", "mid", "end"]),
});

type CoachAssessmentFormData = z.infer<typeof coachAssessmentSchema>;

export default function CoachAssessment() {
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get("athleteId");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [athleteName, setAthleteName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [athleteTimepoints, setAthleteTimepoints] = useState<any[]>([]);
  const [suggestedTimepoint, setSuggestedTimepoint] = useState<"pre" | "mid" | "end">("pre");

  const form = useForm<CoachAssessmentFormData>({
    resolver: zodResolver(coachAssessmentSchema),
    defaultValues: {
      semester_label: "",
      timepoint: "pre",
    },
  });

  useEffect(() => {
    if (!athleteId) {
      toast({
        title: "No athlete selected",
        description: "Please select an athlete to assess",
        variant: "destructive",
      });
      navigate("/coach");
      return;
    }

    // Fetch athlete details and completed assessments
    const fetchAthlete = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", athleteId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Could not load athlete details",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setAthleteName(`${data.first_name} ${data.last_name}`);
      }

      // Fetch athlete's completed assessments to suggest timepoint
      const { data: assessments } = await supabase
        .from("assessments")
        .select("timepoint, created_at")
        .eq("user_id", athleteId)
        .eq("semester_label", form.watch("semester_label") || "Fall 2024")
        .order("created_at", { ascending: false });

      if (assessments && assessments.length > 0) {
        setAthleteTimepoints(assessments);
        const completed = assessments.map((a) => a.timepoint);
        const order: ("pre" | "mid" | "end")[] = ["pre", "mid", "end"];
        const next = order.find((tp) => !completed.includes(tp)) || "end";
        setSuggestedTimepoint(next);
        form.setValue("timepoint", next);
      }
    };

    fetchAthlete();
  }, [athleteId, navigate, toast]);

  const onSubmit = async (data: CoachAssessmentFormData) => {
    if (!athleteId) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const assessmentData = {
        coach_id: user.id,
        athlete_id: athleteId,
        semester_label: data.semester_label,
        timepoint: data.timepoint,
        l1: data.L1,
        l2: data.L2,
        l3: data.L3,
        e1: data.E1,
        e2: data.E2,
        e3: data.E3,
        a1: data.A1,
        a2: data.A2,
        a3: data.A3,
        d1: data.D1,
        d2: data.D2,
        d3: data.D3,
        b1: data.B1,
        b2: data.B2,
        b3: data.B3,
        reflection_voluntary_followership: data.reflection_voluntary_followership,
        reflection_greatest_impact: data.reflection_greatest_impact,
        reflection_growth_area: data.reflection_growth_area,
      };

      const { data: insertedData, error } = await supabase
        .from("coach_assessments")
        .upsert([assessmentData], {
          onConflict: "coach_id,athlete_id,timepoint,semester_label",
        })
        .select()
        .single();

      if (error) throw error;

      // Generate AI insights
      toast({
        title: "Generating Insights...",
        description: "AI is analyzing the assessment to provide actionable feedback.",
      });

      const { data: insightsData, error: insightsError } = await supabase.functions.invoke(
        'generate-coach-insights',
        { body: { assessmentId: insertedData.id } }
      );

      if (insightsError) {
        console.error('Error generating insights:', insightsError);
      }

      toast({
        title: "Assessment Saved",
        description: insightsData?.insights 
          ? `Coach assessment and AI insights for ${athleteName} saved successfully.`
          : `Coach assessment for ${athleteName} saved successfully.`,
      });

      navigate(`/coach-assessment-confirmation?assessmentId=${insertedData.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/coach")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Coach Assessment</h1>
          <p className="text-xl text-muted-foreground">
            Evaluating: <span className="font-semibold text-foreground">{athleteName}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            "Leadership seen. Leadership measured. Leadership multiplied."
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Athlete Progress Indicator */}
            {athleteTimepoints.length > 0 && (
              <Card className="p-6 border-2 border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-lg mb-3">📊 Athlete's Assessment Progress</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {athleteName} has completed assessments for the following timepoints:
                </p>
                <div className="flex gap-3 mb-4">
                  {["pre", "mid", "end"].map((tp) => {
                    const completed = athleteTimepoints.some((a) => a.timepoint === tp);
                    return (
                      <Badge
                        key={tp}
                        variant={completed ? "default" : "outline"}
                        className={completed ? "bg-green-600" : ""}
                      >
                        {completed ? "✓" : "✗"} {tp === "pre" ? "Pre" : tp === "mid" ? "Mid" : "Post"}
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-sm font-medium">
                  💡 Suggested: Complete your <span className="text-primary font-bold">
                    {suggestedTimepoint === "pre" ? "Pre-Season" : suggestedTimepoint === "mid" ? "Mid-Season" : "Post-Season"}
                  </span> coach assessment to match their progress.
                </p>
              </Card>
            )}

            {/* Assessment Metadata */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="semester_label">Semester</Label>
                  <input
                    id="semester_label"
                    type="text"
                    placeholder="e.g., Fall 2024"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    {...form.register("semester_label")}
                  />
                  {form.formState.errors.semester_label && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.semester_label.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timepoint">Assessment Timepoint</Label>
                  <Select
                    value={form.watch("timepoint")}
                    onValueChange={(value) => form.setValue("timepoint", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre">Pre-Season</SelectItem>
                      <SelectItem value="mid">Mid-Season</SelectItem>
                      <SelectItem value="end">Post-Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Domain Sections */}
            <Card className="p-6">
              <CoachAssessmentDomainSection
                form={form}
                domain="L"
                title="Domain 1: Leadership DNA – Integrity, Courage & Emotional Maturity"
                cue="This athlete influences with character first, not charisma."
              />
            </Card>

            <Card className="p-6">
              <CoachAssessmentDomainSection
                form={form}
                domain="E"
                title="Domain 2: Excellence – Standards, Grit & Preparation"
                cue="Excellence isn't a goal — it's their normal."
              />
            </Card>

            <Card className="p-6">
              <CoachAssessmentDomainSection
                form={form}
                domain="A"
                title="Domain 3: Accountability – Ownership, Integrity & Team Impact"
                cue="When accountability increases, tension decreases — they set that tone."
              />
            </Card>

            <Card className="p-6">
              <CoachAssessmentDomainSection
                form={form}
                domain="D"
                title="Domain 4: Discipline – Consistency, Focus & Energy Management"
                cue="Their habits speak louder than their motivation."
              />
            </Card>

            <Card className="p-6">
              <CoachAssessmentDomainSection
                form={form}
                domain="B"
                title="Domain 5: Belonging & Impact – Culture, Empathy & Service"
                cue="They make everyone in the room feel valued and capable."
              />
            </Card>

            {/* Reflection Prompts */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Coach Reflection (Optional)</h2>
              <p className="text-muted-foreground mb-6">
                Provide qualitative insights about this athlete's leadership development.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reflection_voluntary_followership">
                    What behaviors make this athlete someone others follow voluntarily?
                  </Label>
                  <Textarea
                    id="reflection_voluntary_followership"
                    rows={3}
                    placeholder="Describe the specific behaviors that inspire voluntary followership..."
                    {...form.register("reflection_voluntary_followership")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reflection_greatest_impact">
                    When has this athlete's leadership had the greatest positive impact on the team?
                  </Label>
                  <Textarea
                    id="reflection_greatest_impact"
                    rows={3}
                    placeholder="Share a specific example of positive team impact..."
                    {...form.register("reflection_greatest_impact")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reflection_growth_area">
                    What area of growth would make this athlete's influence transformational?
                  </Label>
                  <Textarea
                    id="reflection_growth_area"
                    rows={3}
                    placeholder="Identify the key growth area for transformational leadership..."
                    {...form.register("reflection_growth_area")}
                  />
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/coach")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
