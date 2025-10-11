import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "./LikertItem";

interface DomainSectionProps {
  form: UseFormReturn<any>;
  domain: "L" | "E" | "A" | "D" | "B";
  title: string;
}

const DOMAIN_QUESTIONS = {
  L: [
    "I have a clear understanding of my leadership strengths",
    "I am confident in my ability to lead others",
    "I consistently act in alignment with my core values",
    "I inspire others through my actions and words",
    "I take initiative to lead even when it's challenging",
    "I demonstrate authenticity in my leadership approach",
  ],
  E: [
    "I strive to perform at my best in all that I do",
    "I seek feedback to continuously improve",
    "I set high standards for myself and my work",
    "I embrace challenges as opportunities to grow",
    "I am committed to developing my skills and abilities",
    "I take pride in producing quality work",
  ],
  A: [
    "I take responsibility for my actions and outcomes",
    "I follow through on my commitments",
    "I admit my mistakes and learn from them",
    "I hold myself to the same standards I expect from others",
    "I communicate openly about my progress and challenges",
    "I accept the consequences of my decisions",
  ],
  D: [
    "I maintain consistent daily routines and habits",
    "I stay focused on my goals despite distractions",
    "I complete tasks even when I don't feel motivated",
    "I manage my time effectively",
    "I prioritize long-term goals over short-term comfort",
    "I show up prepared and ready to contribute",
  ],
  B: [
    "I feel a strong sense of connection to my team",
    "I actively work to create an inclusive environment",
    "I value diverse perspectives and contributions",
    "I support my teammates both on and off the field",
    "I communicate openly and respectfully with others",
    "I contribute to building team culture and unity",
  ],
};

export const DomainSection = ({ form, domain, title }: DomainSectionProps) => {
  const questions = DOMAIN_QUESTIONS[domain];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">
          Rate each statement on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree).
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
