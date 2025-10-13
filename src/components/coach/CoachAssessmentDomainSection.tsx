import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "../assessment/LikertItem";

interface CoachAssessmentDomainSectionProps {
  form: UseFormReturn<any>;
  domain: "L" | "E" | "A" | "D" | "B";
  title: string;
  cue: string;
}

const COACH_DOMAIN_QUESTIONS = {
  L: [
    "Demonstrates emotional control and maturity during stressful or competitive moments",
    "Takes initiative to lead without needing recognition or attention",
    "Models honesty and humility even when correcting others or being corrected",
  ],
  E: [
    "Arrives prepared — physically, mentally, and emotionally — for practices, games, and meetings",
    "Maintains high personal standards even when others lower theirs",
    "Pursues feedback proactively and uses it to improve performance",
  ],
  A: [
    "Takes ownership of mistakes and focuses on solutions instead of excuses",
    "Keeps commitments — deadlines, workouts, study halls, and recovery — with reliability",
    "Holds teammates accountable in a respectful, constructive way that builds trust",
  ],
  D: [
    "Demonstrates consistent work ethic across all environments (weight room, classroom, community)",
    "Shows self-control — uses emotion as fuel, not fire",
    "Can re-center focus quickly after adversity or distraction",
  ],
  B: [
    "Intentionally builds connections with teammates of all backgrounds or roles",
    "Encourages others and celebrates effort, not just outcomes",
    "Positively influences team culture through example, inclusion, and communication",
  ],
};

const COACH_LIKERT_LABELS = [
  "Rarely Demonstrated",
  "Occasionally Demonstrated",
  "Sometimes Demonstrated",
  "Consistently Demonstrated",
  "Always Demonstrated",
];

export const CoachAssessmentDomainSection = ({ 
  form, 
  domain, 
  title,
  cue 
}: CoachAssessmentDomainSectionProps) => {
  const questions = COACH_DOMAIN_QUESTIONS[domain];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-1">
          Rate each behavior on a scale from 1 (Rarely Demonstrated) to 5 (Always Demonstrated).
        </p>
        <p className="text-sm italic text-primary mt-3 bg-primary/5 p-3 rounded-lg border border-primary/20">
          🧠 Coach Cue: {cue}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <LikertItem
            key={index}
            form={form}
            name={`${domain}${index + 1}`}
            question={question}
            questionNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
