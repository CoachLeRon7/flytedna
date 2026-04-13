import { useState, useEffect } from "react";
import { PersonalScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  data: PersonalScreenData;
  onComplete: (data: Record<string, string>) => void;
  savedData?: Record<string, string>;
}

const PersonalScreen = ({ data, onComplete, savedData }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData || {});

  const allFilled = data.categories.every((cat, i) => {
    if (cat.wordBank) {
      const selected = (answers[String(i)] || "").split("|||").filter(Boolean);
      return selected.length >= (cat.minSelections || 1);
    }
    return (answers[String(i)] || "").trim().length > 0;
  });

  useEffect(() => {
    if (allFilled) onComplete(answers);
  }, [allFilled, answers, onComplete]);

  const toggleWord = (catIndex: number, word: string) => {
    setAnswers((prev) => {
      const key = String(catIndex);
      const current = (prev[key] || "").split("|||").filter(Boolean);
      const updated = current.includes(word)
        ? current.filter((w) => w !== word)
        : [...current, word];
      return { ...prev, [key]: updated.join("|||") };
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.categories.map((cat, i) => {
          const hasWordBank = !!cat.wordBank;
          const selected = hasWordBank
            ? (answers[String(i)] || "").split("|||").filter(Boolean)
            : [];
          const min = cat.minSelections || 1;

          return (
            <div
              key={i}
              className={`rounded-xl border p-4 transition-all ${
                cat.isHighlighted
                  ? "bg-primary/5 border-primary shadow-md"
                  : "bg-card shadow-card"
              }`}
            >
              <label className="block text-sm font-bold text-foreground mb-1">
                {cat.isHighlighted && <span className="text-primary mr-1">★</span>}
                {cat.label}
              </label>

              {hasWordBank ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select at least {min} — {selected.length} selected
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.wordBank!.map((word) => {
                      const isSelected = selected.includes(word);
                      return (
                        <button
                          key={word}
                          type="button"
                          onClick={() => toggleWord(i, word)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                              : "bg-muted/50 text-foreground border-border hover:border-primary/50 hover:bg-primary/10"
                          )}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                  {cat.allowCustom && (
                    <Textarea
                      placeholder={cat.placeholder || "Or add your own..."}
                      value={answers[`${i}-custom`] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [`${i}-custom`]: e.target.value }))
                      }
                      className="min-h-[50px] resize-none mt-2"
                    />
                  )}
                </>
              ) : (
                <Textarea
                  placeholder={cat.placeholder}
                  value={answers[String(i)] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [String(i)]: e.target.value }))
                  }
                  className="min-h-[80px] resize-none"
                />
              )}
            </div>
          );
        })}
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
