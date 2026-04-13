import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AssessmentHeader } from "@/components/assessment/AssessmentHeader";
import { AssessmentStepper } from "@/components/assessment/AssessmentStepper";
import { DomainSection } from "@/components/assessment/DomainSection";
import { ReflectionsSection } from "@/components/assessment/ReflectionsSection";
import { IntroSection } from "@/components/assessment/IntroSection";
import { ReviewSection } from "@/components/assessment/ReviewSection";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { getUserFriendlyError } from "@/lib/errorHandling";
import { AccessGate } from "@/components/AccessGate";
import { selectRandomQuestions, DOMAIN_CODES, getDomainLabel } from "@/lib/assessmentQuestions";

const assessmentSchema = z.object({
  semester_label: z.string().min(1, "Semester label is required"),
  timepoint: z.enum(["pre", "mid", "end"]),
  // 7 domains × 5 questions each = 35
  // Leadership DNA
  L1: z.number().min(1).max(5).optional(),
  L2: z.number().min(1).max(5).optional(),
  L3: z.number().min(1).max(5).optional(),
  L4: z.number().min(1).max(5).optional(),
  L5: z.number().min(1).max(5).optional(),
  // Identity & Values
  I1: z.number().min(1).max(5).optional(),
  I2: z.number().min(1).max(5).optional(),
  I3: z.number().min(1).max(5).optional(),
  I4: z.number().min(1).max(5).optional(),
  I5: z.number().min(1).max(5).optional(),
  // Emotional Regulation
  R1: z.number().min(1).max(5).optional(),
  R2: z.number().min(1).max(5).optional(),
  R3: z.number().min(1).max(5).optional(),
  R4: z.number().min(1).max(5).optional(),
  R5: z.number().min(1).max(5).optional(),
  // Discipline & Habits
  D1: z.number().min(1).max(5).optional(),
  D2: z.number().min(1).max(5).optional(),
  D3: z.number().min(1).max(5).optional(),
  D4: z.number().min(1).max(5).optional(),
  D5: z.number().min(1).max(5).optional(),
  // Confidence
  C1: z.number().min(1).max(5).optional(),
  C2: z.number().min(1).max(5).optional(),
  C3: z.number().min(1).max(5).optional(),
  C4: z.number().min(1).max(5).optional(),
  C5: z.number().min(1).max(5).optional(),
  // Belonging & Impact
  B1: z.number().min(1).max(5).optional(),
  B2: z.number().min(1).max(5).optional(),
  B3: z.number().min(1).max(5).optional(),
  B4: z.number().min(1).max(5).optional(),
  B5: z.number().min(1).max(5).optional(),
  // Resilience
  S1: z.number().min(1).max(5).optional(),
  S2: z.number().min(1).max(5).optional(),
  S3: z.number().min(1).max(5).optional(),
  S4: z.number().min(1).max(5).optional(),
  S5: z.number().min(1).max(5).optional(),
  // Reflections
  reflections: z.object({
    habits_gap: z.string().max(2000).optional(),
    lead_from_discomfort: z.string().max(2000).optional(),
    who_challenges_you: z.string().max(2000).optional(),
    legacy: z.string().max(2000).optional(),
  }),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

const STEPS = [
  "Intro",
  "Leadership DNA",
  "Identity & Values",
  "Emotional Regulation",
  "Discipline & Habits",
  "Confidence",
  "Belonging & Impact",
  "Resilience",
  "Reflections",
  "Review & Submit",
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Generate randomised questions once per session
  const [sessionSeed] = useState(() => Date.now());
  const randomQuestions = useMemo(() => selectRandomQuestions(sessionSeed), [sessionSeed]);

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      semester_label: "",
      timepoint: "pre",
      reflections: {
        habits_gap: "",
        lead_from_discomfort: "",
        who_challenges_you: "",
        legacy: "",
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const validateCurrentStep = async () => {
    const values = form.getValues();

    if (currentStep === 0) {
      return !!values.semester_label && !!values.timepoint;
    }

    // Steps 1-7 are the 7 domains (5 questions each)
    if (currentStep >= 1 && currentStep <= 7) {
      const domainCode = DOMAIN_CODES[currentStep - 1];
      for (let i = 1; i <= 5; i++) {
        const key = `${domainCode}${i}` as keyof AssessmentFormData;
        if (!values[key]) return false;
      }
      return true;
    }

    // Reflections and Review
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      toast({
        title: "Incomplete Section",
        description: "Please answer all required questions before continuing.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Required", description: "Please log in to submit your assessment.", variant: "destructive" });
        navigate("/auth");
        return;
      }

      // Map new 7-domain fields to existing DB columns (L, E=I, A=R, D, B + extras stored in reflections metadata)
      // Phase 1: Store in the existing 5-domain columns where possible, and use l1-l5 pattern
      // Since DB still has old schema, we map: L→l, I→e (reuse), R→a (reuse), D→d, C→l (overflow), B→b, S→(overflow)
      // Actually for Phase 1 we just store all 35 in the existing columns + overflow
      const { data: assessment, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          semester_label: data.semester_label,
          timepoint: data.timepoint,
          edition: "transformational",
          // Map to existing DB columns (5 domains × 6 cols)
          // L domain → l1-l5
          l1: data.L1,
          l2: data.L2,
          l3: data.L3,
          l4: data.L4,
          l5: data.L5,
          // I (Identity) → e1-e5 (reusing Excellence columns)
          e1: data.I1,
          e2: data.I2,
          e3: data.I3,
          e4: data.I4,
          e5: data.I5,
          // R (Emotional Regulation) → a1-a5 (reusing Accountability columns)
          a1: data.R1,
          a2: data.R2,
          a3: data.R3,
          a4: data.R4,
          a5: data.R5,
          // D (Discipline) → d1-d5
          d1: data.D1,
          d2: data.D2,
          d3: data.D3,
          d4: data.D4,
          d5: data.D5,
          // B (Belonging) → b1-b5
          b1: data.B1,
          b2: data.B2,
          b3: data.B3,
          b4: data.B4,
          b5: data.B5,
          // C (Confidence) & S (Resilience) → store in l6/e6/a6/d6/b6 + overflow in reflections
          l6: data.C1,
          e6: data.C2,
          a6: data.C3,
          d6: data.C4,
          b6: data.C5,
          reflections: {
            ...data.reflections,
            // Store Resilience (S) and extra Confidence data
            resilience_scores: {
              s1: data.S1,
              s2: data.S2,
              s3: data.S3,
              s4: data.S4,
              s5: data.S5,
            },
            question_seed: sessionSeed,
          },
        })
        .select()
        .single();

      if (error) throw error;

      const { error: notificationError } = await supabase.functions.invoke(
        "notify-assessment-completion",
        { body: { assessment_id: assessment.id, user_id: user.id } }
      );
      if (notificationError) console.error("Error sending notifications:", notificationError);

      toast({ title: "Assessment Complete!", description: "Your responses have been saved." });
      navigate(`/results?assessment_id=${assessment.id}`);
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast({ title: "Submission Error", description: getUserFriendlyError(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) return <IntroSection form={form} />;
    if (currentStep >= 1 && currentStep <= 7) {
      const domainCode = DOMAIN_CODES[currentStep - 1];
      return (
        <DomainSection
          form={form}
          domain={domainCode}
          title={getDomainLabel(domainCode)}
          questions={randomQuestions[domainCode]}
        />
      );
    }
    if (currentStep === 8) return <ReflectionsSection form={form} />;
    if (currentStep === 9) return <ReviewSection form={form} />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <AccessGate requireAccess={true}>
      <div className="min-h-screen bg-muted/30">
        <AssessmentHeader />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <AssessmentStepper currentStep={currentStep} steps={STEPS} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
              <div className="bg-card rounded-lg shadow-card p-8">
                {renderStepContent()}
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button type="button" onClick={handleNext}>
                    Save and Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </main>
      </div>
    </AccessGate>
  );
};

export default Assessment;
