import { useState, useEffect } from "react";
import { WorkbookScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface Props {
  data: WorkbookScreenData;
  onComplete: (data: Record<string, string>) => void;
  savedData?: Record<string, string>;
}

const WorkbookScreen = ({ data, onComplete, savedData }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>(savedData || {});

  const allFilled = data.prompts.every((prompt, i) => {
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
        {data.prompts.map((prompt, i) => (
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
        ))}
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
