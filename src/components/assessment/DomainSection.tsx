import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "./LikertItem";

interface DomainSectionProps {
  form: UseFormReturn<any>;
  domain: "L" | "E" | "A" | "D" | "B";
  title: string;
}

const DOMAIN_QUESTIONS = {
  L: [
    "I am willing to risk being misunderstood if it means standing for what's right",
    "I can identify the values that guide my decisions, even under pressure",
    "I am aware of how my tone and body language affect my influence",
    "I seek truth from people who challenge my perspective, not just those who affirm it",
    "I lead with empathy, not ego",
    "I can admit when my presence is part of the problem, not just the solution",
  ],
  E: [
    "I evaluate success by how well I executed my process, not just the outcome",
    "I study my mistakes with curiosity, not shame",
    "I know how to reset my focus after a personal or team failure",
    "I consistently hold myself to higher standards than others expect of me",
    "I prioritize consistency over intensity when pursuing growth",
    "I create environments where others feel safe to strive for excellence",
  ],
  A: [
    "I take initiative to repair relationships when I've hurt trust",
    "I don't excuse my behavior based on how others treated me first",
    "I respond to failure with action, not explanation",
    "I deliver on commitments even when motivation fades or credit won't be given",
    "I hold teammates accountable with respect, not control",
    "I consistently align my intentions with my actions",
  ],
  D: [
    "I do what's necessary even when it's uncomfortable or unseen",
    "I can delay short-term pleasure for long-term purpose",
    "I train my mindset daily as intentionally as I train my body",
    "I protect my time and energy from distractions that compromise my goals",
    "I can stay composed and effective when plans fall apart",
    "My habits reflect who I say I want to become",
  ],
  B: [
    "I intentionally build bridges with people who are different from me",
    "I recognize when my leadership unintentionally excludes or overshadows others",
    "I use my influence to amplify those who often go unnoticed",
    "I think beyond my sport — how I lead in my community, family, and future",
    "I mentor others without expecting anything in return",
    "I want to be remembered for how I made people feel, not just what I achieved",
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
