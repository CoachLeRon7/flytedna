import { useEffect } from "react";
import { ConceptScreenData } from "@/lib/moduleScreenData";
import { Lightbulb } from "lucide-react";

interface Props {
  data: ConceptScreenData;
  onComplete: (data: unknown) => void;
}

const ConceptScreen = ({ data, onComplete }: Props) => {
  useEffect(() => {
    onComplete(true);
  }, [onComplete]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-foreground">{data.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{data.description}</p>
      </div>

      <div className="space-y-3 mb-6">
        {data.layers.map((layer, i) => (
          <div
            key={layer.label}
            className={`rounded-xl border p-5 transition-all ${
              i === data.layers.length - 1
                ? "bg-primary/10 border-primary shadow-md"
                : "bg-card shadow-card"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{layer.icon}</span>
              <div>
                <h3 className="font-bold text-foreground text-lg">{layer.label}</h3>
                <p className="text-sm text-muted-foreground">{layer.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-foreground">{data.insight}</p>
      </div>
    </div>
  );
};

export default ConceptScreen;
