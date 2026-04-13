import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "./LikertItem";
import { QuestionConfig, DomainCode, DOMAIN_CONFIGS } from "@/lib/assessmentQuestions";

interface DomainSectionProps {
  form: UseFormReturn<any>;
  domain: DomainCode;
  title: string;
  questions: QuestionConfig[];
}

export const DomainSection = ({ form, domain, title, questions }: DomainSectionProps) => {
  const config = DOMAIN_CONFIGS[domain];
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground">
          How true is this for you <strong>MOST</strong> of the time? Rate each statement from 1 (Never Me) to 5 (Always Me).
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <LikertItem
            key={index}
            form={form}
            name={`${domain}${index + 1}`}
            question={question.text}
            questionNumber={index + 1}
            reversed={question.reversed}
          />
        ))}
      </div>
    </div>
  );
};
