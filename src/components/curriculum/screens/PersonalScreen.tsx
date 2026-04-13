import { useState, useEffect } from "react";
import { PersonalScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  data: PersonalScreenData;
  onComplete: (data: Record<string, string>) => void;
  savedData?: Record<string, string>;
}

const PersonalScreen = ({ data, onComplete, savedData }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData || {});

  const allFilled = data.categories.every((_, i) => (answers[String(i)] || "").trim().length > 0);

  useEffect(() => {
    if (allFilled) onComplete(answers);
  }, [allFilled, answers, onComplete]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.categories.map((cat, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 transition-all ${
              cat.isHighlighted
                ? "bg-primary/5 border-primary shadow-md"
                : "bg-card shadow-card"
            }`}
          >
            <label className="block text-sm font-bold text-foreground mb-2">
              {cat.isHighlighted && <span className="text-primary mr-1">★</span>}
              {cat.label}
            </label>
            <Textarea
              placeholder={cat.placeholder}
              value={answers[String(i)] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [String(i)]: e.target.value }))
              }
              className="min-h-[80px] resize-none"
            />
          </div>
        ))}
      </div>

      {!allFilled && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Fill in all categories to continue
        </p>
      )}
    </div>
  );
};

export default PersonalScreen;
