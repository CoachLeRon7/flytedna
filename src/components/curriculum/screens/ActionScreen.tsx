import { useState, useEffect } from "react";
import { ActionScreenData } from "@/lib/moduleScreenData";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  data: ActionScreenData;
  onComplete: (data: unknown) => void;
}

const ActionScreen = ({ data, onComplete }: Props) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [definingPhase, setDefiningPhase] = useState(false);

  const currentStep = data.steps[stepIndex];
  const targetCount = currentStep?.count ?? 0;
  const isNarrowing = stepIndex > 0;
  const isDone = definingPhase;

  const finalValues = definingPhase ? selected : [];
  const allDefined = finalValues.length > 0 && finalValues.every((v) => (definitions[v] || "").trim().length > 0);

  useEffect(() => {
    if (allDefined) onComplete({ values: finalValues, definitions });
  }, [allDefined, finalValues, definitions, onComplete]);

  const handleToggle = (value: string) => {
    if (definingPhase) return;

    if (isNarrowing) {
      if (selected.includes(value)) {
        setSelected((s) => s.filter((v) => v !== value));
      }
      return;
    }

    if (selected.includes(value)) {
      setSelected((s) => s.filter((v) => v !== value));
    } else if (selected.length < targetCount) {
      setSelected((s) => [...s, value]);
    }
  };

  const handleStepProceed = () => {
    if (stepIndex < data.steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setDefiningPhase(true);
    }
  };

  const readyToAdvance = selected.length === targetCount;
  const availableValues = isNarrowing ? selected : data.values;
  const fadedValues = isNarrowing
    ? data.values.filter((v) => !selected.includes(v))
    : [];

  const defs = data.valueDefinitions || {};

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      {!definingPhase && (
        <TooltipProvider delayDuration={300}>
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{currentStep.instruction}</p>
            <Badge variant={readyToAdvance ? "default" : "secondary"} className="text-sm">
              {selected.length}/{targetCount}
            </Badge>
          </div>

          {Object.keys(defs).length > 0 && (
            <p className="text-xs text-muted-foreground mb-3 text-center italic">
              💡 Tap and hold a value to see its definition
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {data.values.map((value) => {
              const isSelected = selected.includes(value);
              const isFaded = fadedValues.includes(value);
              const definition = defs[value];

              const chip = (
                <button
                  key={value}
                  onClick={() => handleToggle(value)}
                  disabled={isFaded}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isFaded
                      ? "opacity-20 cursor-not-allowed border-transparent bg-muted text-muted-foreground"
                      : isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                      : "bg-card border-border text-foreground hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  {value}
                </button>
              );

              if (definition && !isFaded) {
                return (
                  <Tooltip key={value}>
                    <TooltipTrigger asChild>{chip}</TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-center">
                      <p className="text-xs">{definition}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return chip;
            })}
          </div>

          {readyToAdvance && (
            <div className="text-center">
              <button
                onClick={handleStepProceed}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                {stepIndex < data.steps.length - 1 ? "Next: Narrow Down →" : "Lock In & Define →"}
              </button>
            </div>
          )}
        </TooltipProvider>
      )}

      {definingPhase && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">{data.definitionPrompt}</p>
          {selected.map((value) => (
            <div key={value} className="bg-card border rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{value}</Badge>
                {defs[value] && (
                  <span className="text-xs text-muted-foreground italic">— {defs[value]}</span>
                )}
              </div>
              <Textarea
                placeholder={`Define "${value}" as a specific behavior...`}
                value={definitions[value] || ""}
                onChange={(e) =>
                  setDefinitions((prev) => ({ ...prev, [value]: e.target.value }))
                }
                className="min-h-[60px] resize-none"
              />
            </div>
          ))}
          {!allDefined && (
            <p className="text-xs text-muted-foreground text-center">
              Define each value to continue
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionScreen;
