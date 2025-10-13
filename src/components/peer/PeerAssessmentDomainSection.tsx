import { UseFormReturn } from "react-hook-form";
import { LikertItem } from "@/components/assessment/LikertItem";

interface PeerDomainSectionProps {
  form: UseFormReturn<any>;
  domain: string;
  title: string;
}

const PEER_DOMAIN_QUESTIONS: Record<string, string[]> = {
  L: [
    "This teammate's words and actions match — they are reliable even when no one is watching.",
    "They influence others through example more than through authority or popularity.",
    "I feel comfortable being honest or vulnerable around this person.",
  ],
  E: [
    "This teammate holds themselves to high standards and expects the same from others respectfully.",
    "They put in consistent effort regardless of playing time, role, or recognition.",
    "Their attitude helps raise the standard for everyone during training or competition.",
  ],
  A: [
    "This teammate admits when they're wrong or when they've made a mistake.",
    "They take responsibility for their effort and attitude, not just their results.",
    "They hold others accountable with respect, not ego.",
  ],
  D: [
    "This teammate shows consistent discipline in workouts, practice habits, and preparation.",
    "They stay focused and composed even when things go wrong.",
    "They are dependable when the team needs them most — they don't let distractions affect the group.",
  ],
  B: [
    "This teammate helps create an environment where everyone feels seen and valued.",
    "They celebrate others' success without jealousy or comparison.",
    "They make the team better by the way they treat people — not just by how they perform.",
  ],
};

const DOMAIN_CUES: Record<string, string> = {
  L: "You can trust them to lead the right way, not just the loud way.",
  E: "They raise the bar without putting others down.",
  A: "They make accountability feel like unity, not criticism.",
  D: "They don't just train hard — they train with purpose.",
  B: "They make everyone around them believe they belong.",
};

export const PeerAssessmentDomainSection = ({
  form,
  domain,
  title,
}: PeerDomainSectionProps) => {
  const questions = PEER_DOMAIN_QUESTIONS[domain] || [];
  const cue = DOMAIN_CUES[domain];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground italic mb-4">
          🧠 Peer Cue: "{cue}"
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          1 = Rarely Demonstrated | 2 = Occasionally | 3 = Sometimes | 4 = Consistently | 5 = Always
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <LikertItem
            key={`${domain.toLowerCase()}${index + 1}`}
            form={form}
            name={`${domain.toLowerCase()}${index + 1}`}
            question={question}
            questionNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
