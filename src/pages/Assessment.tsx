import { useState } from "react";
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

const assessmentSchema = z.object({
  semester_label: z.string().min(1, "Semester label is required"),
  timepoint: z.enum(["pre", "mid", "end"]),
  // Leadership DNA
  L1: z.number().min(1).max(5).optional(),
  L2: z.number().min(1).max(5).optional(),
  L3: z.number().min(1).max(5).optional(),
  L4: z.number().min(1).max(5).optional(),
  L5: z.number().min(1).max(5).optional(),
  L6: z.number().min(1).max(5).optional(),
  // Excellence
  E1: z.number().min(1).max(5).optional(),
  E2: z.number().min(1).max(5).optional(),
  E3: z.number().min(1).max(5).optional(),
  E4: z.number().min(1).max(5).optional(),
  E5: z.number().min(1).max(5).optional(),
  E6: z.number().min(1).max(5).optional(),
  // Accountability
  A1: z.number().min(1).max(5).optional(),
  A2: z.number().min(1).max(5).optional(),
  A3: z.number().min(1).max(5).optional(),
  A4: z.number().min(1).max(5).optional(),
  A5: z.number().min(1).max(5).optional(),
  A6: z.number().min(1).max(5).optional(),
  // Discipline
  D1: z.number().min(1).max(5).optional(),
  D2: z.number().min(1).max(5).optional(),
  D3: z.number().min(1).max(5).optional(),
  D4: z.number().min(1).max(5).optional(),
  D5: z.number().min(1).max(5).optional(),
  D6: z.number().min(1).max(5).optional(),
  // Belonging
  B1: z.number().min(1).max(5).optional(),
  B2: z.number().min(1).max(5).optional(),
  B3: z.number().min(1).max(5).optional(),
  B4: z.number().min(1).max(5).optional(),
  B5: z.number().min(1).max(5).optional(),
  B6: z.number().min(1).max(5).optional(),
  // Reflections (optional)
  reflections: z.object({
    habits_gap: z.string().optional(),
    lead_from_discomfort: z.string().optional(),
    who_challenges_you: z.string().optional(),
    legacy: z.string().optional(),
  }),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

const STEPS = [
  "Intro",
  "Leadership DNA",
  "Excellence",
  "Accountability",
  "Discipline",
  "Belonging & Impact",
  "Reflections",
  "Review & Submit",
];

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      semester_label: "",
      timepoint: "pre",
      // Leadership DNA defaults
      L1: undefined,
      L2: undefined,
      L3: undefined,
      L4: undefined,
      L5: undefined,
      L6: undefined,
      // Excellence defaults
      E1: undefined,
      E2: undefined,
      E3: undefined,
      E4: undefined,
      E5: undefined,
      E6: undefined,
      // Accountability defaults
      A1: undefined,
      A2: undefined,
      A3: undefined,
      A4: undefined,
      A5: undefined,
      A6: undefined,
      // Discipline defaults
      D1: undefined,
      D2: undefined,
      D3: undefined,
      D4: undefined,
      D5: undefined,
      D6: undefined,
      // Belonging defaults
      B1: undefined,
      B2: undefined,
      B3: undefined,
      B4: undefined,
      B5: undefined,
      B6: undefined,
      reflections: {
        habits_gap: "",
        lead_from_discomfort: "",
        who_challenges_you: "",
        legacy: "",
      },
    },
    mode: "onChange",
  });

  const validateCurrentStep = async () => {
    const values = form.getValues();

    switch (currentStep) {
      case 0: // Intro
        return values.semester_label && values.timepoint;
      case 1: // Leadership DNA
        return values.L1 && values.L2 && values.L3 && values.L4 && values.L5 && values.L6;
      case 2: // Excellence
        return values.E1 && values.E2 && values.E3 && values.E4 && values.E5 && values.E6;
      case 3: // Accountability
        return values.A1 && values.A2 && values.A3 && values.A4 && values.A5 && values.A6;
      case 4: // Discipline
        return values.D1 && values.D2 && values.D3 && values.D4 && values.D5 && values.D6;
      case 5: // Belonging
        return values.B1 && values.B2 && values.B3 && values.B4 && values.B5 && values.B6;
      case 6: // Reflections (optional, no validation)
        return true;
      case 7: // Review (no validation, just review)
        return true;
    }

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
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your assessment.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const { data: assessment, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          semester_label: data.semester_label,
          timepoint: data.timepoint,
          edition: "transformational",
          l1: data.L1,
          l2: data.L2,
          l3: data.L3,
          l4: data.L4,
          l5: data.L5,
          l6: data.L6,
          e1: data.E1,
          e2: data.E2,
          e3: data.E3,
          e4: data.E4,
          e5: data.E5,
          e6: data.E6,
          a1: data.A1,
          a2: data.A2,
          a3: data.A3,
          a4: data.A4,
          a5: data.A5,
          a6: data.A6,
          d1: data.D1,
          d2: data.D2,
          d3: data.D3,
          d4: data.D4,
          d5: data.D5,
          d6: data.D6,
          b1: data.B1,
          b2: data.B2,
          b3: data.B3,
          b4: data.B4,
          b5: data.B5,
          b6: data.B6,
          reflections: data.reflections,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger notification edge function
      const { error: notificationError } = await supabase.functions.invoke(
        "notify-assessment-completion",
        {
          body: {
            assessment_id: assessment.id,
            user_id: user.id,
          },
        }
      );

      if (notificationError) {
        console.error("Error sending notifications:", notificationError);
      }

      toast({
        title: "Assessment Complete!",
        description: "Your responses have been saved. Notifications sent to your team.",
      });

      navigate(`/results?assessment_id=${assessment.id}`);
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Submission Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <IntroSection form={form} />;
      case 1:
        return <DomainSection form={form} domain="L" title="Leadership DNA" />;
      case 2:
        return <DomainSection form={form} domain="E" title="Excellence" />;
      case 3:
        return <DomainSection form={form} domain="A" title="Accountability" />;
      case 4:
        return <DomainSection form={form} domain="D" title="Discipline" />;
      case 5:
        return <DomainSection form={form} domain="B" title="Belonging & Impact" />;
      case 6:
        return <ReflectionsSection form={form} />;
      case 7:
        return <ReviewSection form={form} />;
      default:
        return null;
    }
  };

  return (
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
  );
};

export default Assessment;
