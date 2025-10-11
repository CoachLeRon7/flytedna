import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentStepperProps {
  currentStep: number;
  steps: string[];
}

export const AssessmentStepper = ({ currentStep, steps }: AssessmentStepperProps) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                index < currentStep
                  ? "bg-success border-success text-success-foreground"
                  : index === currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center hidden md:block",
                index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 h-0.5 -z-10 hidden md:block",
                  index < currentStep ? "bg-success" : "bg-border"
                )}
                style={{
                  left: `${(index / (steps.length - 1)) * 100}%`,
                  width: `${100 / (steps.length - 1)}%`,
                }}
              />
            )}
          </div>
        ))}
      </div>
      {/* Mobile step indicator */}
      <div className="md:hidden text-center mt-4">
        <p className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </p>
      </div>
    </div>
  );
};
