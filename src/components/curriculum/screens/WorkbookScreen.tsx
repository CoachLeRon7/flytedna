import { useState, useEffect } from "react";
import { WorkbookScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: WorkbookScreenData;
  onComplete: (data: Record<string, string>) => void;
  savedData?: Record<string, string>;
}

const WorkbookScreen = ({ data, onComplete, savedData }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData || {});

  const allFilled = data.prompts.every((prompt, i) => {
    if (prompt.wordBank) {
      const selected = (answers[String(i)] || "").split("|||").filter(Boolean);
      return selected.length >= (prompt.minSelections || 1);
    }
    if (prompt.multiField && prompt.fieldCount) {
      return Array.from({ length: prompt.fieldCount }, (_, j) => answers[`${i}-${j}`] || "").every(
        (v) => v.trim().length > 0
      );
    }
    return (answers[String(i)] || "").trim().length > 0;
  });

  useEffect(() => {
    if (allFilled) onComplete(answers);
  }, [allFilled, answers, onComplete]);

  const toggleWord = (promptIndex: number, word: string) => {
    setAnswers((prev) => {
      const key = String(promptIndex);
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
        <div className="flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Private — only you can see these answers</span>
        </div>
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      <div className="space-y-5">
        {data.prompts.map((prompt, i) => {
          if (prompt.wordBank) {
            const selected = (answers[String(i)] || "").split("|||").filter(Boolean);
            const min = prompt.minSelections || 1;
            return (
              <div key={i} className="bg-card border rounded-xl p-4 shadow-card">
                <label className="block text-sm font-bold text-foreground mb-1">{prompt.label}</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select at least {min} — {selected.length} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {prompt.wordBank.map((word) => {
                    const isSelected = selected.includes(word);
                    return (
                      <button
                        key={word}
                        type="button"
                        onClick={() => toggleWord(i, word)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
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
              </div>
            );
          }

          return (
            <div key={i} className="bg-card border rounded-xl p-4 shadow-card">
              <label className="block text-sm font-bold text-foreground mb-2">{prompt.label}</label>
              {prompt.multiField && prompt.fieldCount ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: prompt.fieldCount }, (_, j) => (
                    <Input
                      key={j}
                      placeholder={`Word ${j + 1}`}
                      value={answers[`${i}-${j}`] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [`${i}-${j}`]: e.target.value }))
                      }
                    />
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder={prompt.placeholder}
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
          Complete all fields to continue
        </p>
      )}
    </div>
  );
};

export default WorkbookScreen;
