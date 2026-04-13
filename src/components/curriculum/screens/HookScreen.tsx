import { useEffect } from "react";
import { HookScreenData } from "@/lib/moduleScreenData";
import { Quote } from "lucide-react";

interface Props {
  data: HookScreenData;
  onComplete: (data: unknown) => void;
}

const HookScreen = ({ data, onComplete }: Props) => {
  useEffect(() => {
    // Hook screen just needs acknowledgment — auto-enable continue
    onComplete(true);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
      <div className="bg-card border rounded-2xl p-8 shadow-card max-w-xl w-full">
        <Quote className="h-8 w-8 text-accent mx-auto mb-4 opacity-60" />
        <blockquote className="text-xl md:text-2xl font-bold text-foreground italic leading-relaxed mb-3">
          "{data.quote.text}"
        </blockquote>
        <p className="text-sm font-semibold text-primary mb-8">— {data.quote.author}</p>

        <div className="border-t border-border pt-6">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
            {data.hookQuestion}
          </h2>
          {data.hookSubtext && (
            <p className="text-muted-foreground text-sm">{data.hookSubtext}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HookScreen;
