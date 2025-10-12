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
  L1: z.number().min(1).max(5),
  L2: z.number().min(1).max(5),
  L3: z.number().min(1).max(5),
  L4: z.number().min(1).max(5),
  L5: z.number().min(1).max(5),
  L6: z.number().min(1).max(5),
  // Excellence
  E1: z.number().min(1).max(5),
  E2: z.number().min(1).max(5),
  E3: z.number().min(1).max(5),
  E4: z.number().min(1).max(5),
  E5: z.number().min(1).max(5),
  E6: z.number().min(1).max(5),
  // Accountability
  A1: z.number().min(1).max(5),
  A2: z.number().min(1).max(5),
  A3: z.number().min(1).max(5),
  A4: z.number().min(1).max(5),
  A5: z.number().min(1).max(5),
  A6: z.number().min(1).max(5),
  // Discipline
  D1: z.number().min(1).max(5),
  D2: z.number().min(1).max(5),
  D3: z.number().min(1).max(5),
  D4: z.number().min(1).max(5),
  D5: z.number().min(1).max(5),
  D6: z.number().min(1).max(5),
  // Belonging
  B1: z.number().min(1).max(5),
  B2: z.number().min(1).max(5),
  B3: z.number().min(1).max(5),
  B4: z.number().min(1).max(5),
  B5: z.number().min(1).max(5),
  B6: z.number().min(1).max(5),
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
    const fieldsToValidate: (keyof AssessmentFormData)[] = [];

    switch (currentStep) {
      case 0: // Intro
        fieldsToValidate.push("semester_label", "timepoint");
        break;
      case 1: // Leadership DNA
        fieldsToValidate.push("L1", "L2", "L3", "L4", "L5", "L6");
        break;
      case 2: // Excellence
        fieldsToValidate.push("E1", "E2", "E3", "E4", "E5", "E6");
        break;
      case 3: // Accountability
        fieldsToValidate.push("A1", "A2", "A3", "A4", "A5", "A6");
        break;
      case 4: // Discipline
        fieldsToValidate.push("D1", "D2", "D3", "D4", "D5", "D6");
        break;
      case 5: // Belonging
        fieldsToValidate.push("B1", "B2", "B3", "B4", "B5", "B6");
        break;
      case 6: // Reflections (optional, no validation)
        return true;
      case 7: // Review (no validation, just review)
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
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

      toast({
        title: "Assessment Complete!",
        description: "Your responses have been saved. Viewing your results...",
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
