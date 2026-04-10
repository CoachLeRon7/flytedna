import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, GraduationCap, School } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";
import { middleSchoolTrack, highSchoolTrack } from "@/lib/curriculumData";
import ModuleCard from "@/components/curriculum/ModuleCard";
import LearningLoopVisual from "@/components/curriculum/LearningLoopVisual";

const Curriculum = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <img
            src={logo}
            alt="FLY.TE Academy"
            className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          />
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-foreground mb-2">
            B.coming Curriculum
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A 16-module leadership development journey — built for student-athletes who are ready to lead from the inside out.
          </p>
        </div>

        {/* Learning Loop */}
        <div className="bg-card border rounded-xl p-6 mb-10 shadow-card">
          <LearningLoopVisual />
        </div>

        {/* Track Tabs */}
        <Tabs defaultValue="middle" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="middle" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Middle School
            </TabsTrigger>
            <TabsTrigger value="high" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              High School
            </TabsTrigger>
          </TabsList>

          {[
            { value: "middle", track: middleSchoolTrack },
            { value: "high", track: highSchoolTrack },
          ].map(({ value, track }) => (
            <TabsContent key={value} value={value}>
              <p className="text-sm text-muted-foreground mb-6">{track.description}</p>
              <div className="grid gap-5 md:grid-cols-2">
                {track.modules.map((mod) => (
                  <ModuleCard key={mod.number} module={mod} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Curriculum;
