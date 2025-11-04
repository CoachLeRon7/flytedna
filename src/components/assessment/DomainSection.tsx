import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "./LikertItem";
import { getQuestionsForAge, QuestionConfig } from "@/lib/assessmentQuestions";

interface DomainSectionProps {
  form: UseFormReturn<any>;
  domain: "L" | "E" | "A" | "D" | "B";
  title: string;
  userAge: number | null;
}

export const DomainSection = ({ form, domain, title, userAge }: DomainSectionProps) => {
  const allQuestions = getQuestionsForAge(userAge);
  const questions: QuestionConfig[] = allQuestions[domain];

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
            question={question.text}
            questionNumber={index + 1}
            reversed={question.reversed}
          />
        ))}
      </div>
    </div>
  );
};
