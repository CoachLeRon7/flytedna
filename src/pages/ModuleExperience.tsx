import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";
import { getModuleExperience } from "@/lib/moduleScreenData";
import HookScreen from "@/components/curriculum/screens/HookScreen";
import WorkbookScreen from "@/components/curriculum/screens/WorkbookScreen";
import ConceptScreen from "@/components/curriculum/screens/ConceptScreen";
import PersonalScreen from "@/components/curriculum/screens/PersonalScreen";
import ActionScreen from "@/components/curriculum/screens/ActionScreen";
import StatementScreen from "@/components/curriculum/screens/StatementScreen";
import PlanScreen from "@/components/curriculum/screens/PlanScreen";

const ModuleExperience = () => {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const track = (searchParams.get("track") as "middle" | "high") || "middle";
  const moduleNumber = parseInt(moduleId || "1", 10);

  const moduleData = getModuleExperience(moduleNumber, track);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [screenData, setScreenData] = useState<Record<number, unknown>>({});
  const [canProceed, setCanProceed] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleScreenComplete = useCallback((data: unknown) => {
    setScreenData((prev) => ({ ...prev, [currentScreen]: data }));
    setCanProceed(true);
  }, [currentScreen]);

  if (!moduleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Module Not Available</h2>
          <p className="text-muted-foreground mb-4">This interactive module isn't available yet.</p>
          <Button onClick={() => navigate("/curriculum")}>Back to Curriculum</Button>
        </div>
      </div>
    );
  }

  const totalScreens = moduleData.screens.length;
  const progress = completed ? 100 : ((currentScreen) / totalScreens) * 100;
  const screen = moduleData.screens[currentScreen];
  const isLastScreen = currentScreen === totalScreens - 1;

  const handleNext = () => {
    if (isLastScreen) {
      setCompleted(true);
      // Save completion to database
      saveCompletion();
    } else {
      setCurrentScreen((s) => s + 1);
      setCanProceed(false);
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen((s) => s - 1);
      setCanProceed(true);
    }
  };

  const stepLabels = ["B", "C", "O", "M", "I", "N", "G"];

  if (completed) {
    const planScreen = moduleData.screens[totalScreens - 1];
    const completionMessage =
      planScreen.type === "plan" ? planScreen.completionMessage : "Module Complete!";
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center p-8">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-4">Module {moduleNumber} Complete!</h1>
          <p className="text-muted-foreground mb-8">{completionMessage}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/curriculum")}>
              Back to Curriculum
            </Button>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="FLY.TE Academy"
              className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            />
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Module {moduleNumber}</p>
              <h2 className="text-sm font-bold text-foreground leading-tight">{moduleData.moduleTitle}</h2>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/curriculum")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Exit
          </Button>
        </div>
        {/* Step indicators */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex items-center gap-1 mb-2">
            {stepLabels.map((label, i) => (
              <div
                key={label}
                className={`flex-1 flex items-center justify-center h-8 rounded-md text-xs font-black transition-all ${
                  i === currentScreen
                    ? "bg-primary text-primary-foreground shadow-md"
                    : i < currentScreen
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </header>

      {/* Screen content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        {screen.type === "hook" && (
          <HookScreen data={screen} onComplete={handleScreenComplete} />
        )}
        {screen.type === "workbook" && (
          <WorkbookScreen data={screen} onComplete={handleScreenComplete} savedData={screenData[currentScreen] as Record<string, string> | undefined} />
        )}
        {screen.type === "concept" && (
          <ConceptScreen data={screen} onComplete={handleScreenComplete} />
        )}
        {screen.type === "personal" && (
          <PersonalScreen data={screen} onComplete={handleScreenComplete} savedData={screenData[currentScreen] as Record<string, string> | undefined} />
        )}
        {screen.type === "action" && (
          <ActionScreen data={screen} onComplete={handleScreenComplete} />
        )}
        {screen.type === "statement" && (
          <StatementScreen data={screen} onComplete={handleScreenComplete} savedData={screenData[currentScreen] as string | undefined} allScreenData={screenData} />
        )}
        {screen.type === "plan" && (
          <PlanScreen data={screen} onComplete={handleScreenComplete} savedData={screenData[currentScreen] as string | undefined} />
        )}
      </main>

      {/* Navigation footer */}
      <footer className="bg-background border-t border-border sticky bottom-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-2xl">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentScreen === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <span className="text-xs text-muted-foreground">
            Step {currentScreen + 1} of {totalScreens}
          </span>
          <Button onClick={handleNext} disabled={!canProceed}>
            {isLastScreen ? "Complete" : "Continue"}
            {!isLastScreen && <ArrowRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ModuleExperience;
