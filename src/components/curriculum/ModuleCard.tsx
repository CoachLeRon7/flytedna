import { useNavigate } from "react-router-dom";
import { CurriculumModule } from "@/lib/curriculumData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Clock, Lock, BookOpen, Target, Lightbulb, Play } from "lucide-react";

interface ModuleCardProps {
  module: CurriculumModule;
  track?: "middle" | "high";
}

const ModuleCard = ({ module, track = "middle" }: ModuleCardProps) => {
  const navigate = useNavigate();
  const isLocked = module.isPlaceholder;
  const hasInteractive = module.number <= 3;

  return (
    <div
      className={`rounded-xl border bg-card shadow-card transition-all ${
        isLocked ? "opacity-60 border-dashed" : "hover:shadow-elegant"
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                isLocked
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {module.number}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg leading-tight">{module.title}</h3>
              {module.subtitle && (
                <p className="text-sm text-muted-foreground">{module.subtitle}</p>
              )}
            </div>
          </div>
          {isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary shrink-0 mt-1" />
          )}
        </div>

        {module.quote && (
          <blockquote className="mt-3 border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">
            "{module.quote.text}"
            <span className="block text-xs font-semibold mt-1 not-italic">— {module.quote.author}</span>
          </blockquote>
        )}
      </div>

      {/* Key Concepts as badges */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
        {module.keyConcepts.map((concept) => (
          <Badge key={concept} variant="secondary" className="text-[11px]">
            {concept}
          </Badge>
        ))}
      </div>

      {/* Expandable content */}
      {!isLocked && (
        <Accordion type="single" collapsible className="px-5 pb-4">
          {/* Objectives */}
          <AccordionItem value="objectives" className="border-border/50">
            <AccordionTrigger className="text-sm font-semibold py-2 hover:no-underline">
              <span className="flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                Learning Objectives
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {module.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    {obj}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Activities */}
          {module.activities.length > 0 && (
            <AccordionItem value="activities" className="border-border/50">
              <AccordionTrigger className="text-sm font-semibold py-2 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Activities ({module.activities.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {module.activities.map((activity, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">{activity.title}</span>
                        {activity.duration && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      {activity.prompts && activity.prompts.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {activity.prompts.map((prompt, j) => (
                            <li key={j} className="text-xs text-muted-foreground pl-3 border-l-2 border-accent/30">
                              {prompt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Assessment */}
          {module.assessment && (
            <AccordionItem value="assessment" className="border-b-0">
              <AccordionTrigger className="text-sm font-semibold py-2 hover:no-underline">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Assessment Criteria
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Formative</span>
                    <ul className="mt-1 space-y-1">
                      {module.assessment.formative.map((item, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-muted-foreground">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Summative</span>
                    <ul className="mt-1 space-y-1">
                      {module.assessment.summative.map((item, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-muted-foreground">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      {/* Start Module button */}
      {!isLocked && hasInteractive && (
        <div className="px-5 pb-4">
          <Button
            onClick={() => navigate(`/curriculum/module/${module.number}?track=${track}`)}
            className="w-full"
            size="sm"
          >
            <Play className="mr-1 h-4 w-4" />
            Start Module {module.number}
          </Button>
        </div>
      )}

      {/* Placeholder message */}
      {isLocked && (
        <div className="px-5 pb-4">
          <p className="text-sm text-muted-foreground italic">Coming soon — module content is being developed.</p>
        </div>
      )}
    </div>
  );
};

export default ModuleCard;
