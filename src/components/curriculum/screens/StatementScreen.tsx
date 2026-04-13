import { useState, useEffect } from "react";
import { StatementScreenData } from "@/lib/moduleScreenData";
import { Textarea } from "@/components/ui/textarea";
import { PenLine } from "lucide-react";

interface Props {
  data: StatementScreenData;
  onComplete: (data: string) => void;
  savedData?: string;
}

const StatementScreen = ({ data, onComplete, savedData }: Props) => {
  const [statement, setStatement] = useState(savedData || "");

  const isFilled = statement.trim().length > 20;

  useEffect(() => {
    if (isFilled) onComplete(statement);
  }, [isFilled, statement, onComplete]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <PenLine className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Template</span>
        </div>
        <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg p-3 leading-relaxed">
          {data.template}
        </p>
      </div>

      <div className="bg-card border rounded-xl p-5 shadow-card">
        <Textarea
          placeholder="Write your statement here... Use the template above as a guide, but make it yours."
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          className="min-h-[120px] resize-none text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">{data.helpText}</p>
      </div>

      {!isFilled && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Write at least 20 characters to continue
        </p>
      )}
    </div>
  );
};

export default StatementScreen;
