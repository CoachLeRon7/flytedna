import { learningLoopSteps } from "@/lib/curriculumData";

const LearningLoopVisual = () => {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center text-foreground mb-2">
        The B.coming Learning Loop
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
        Every module follows this 7-step experiential learning cycle — designed to move knowledge from the head to the heart to the hands.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {learningLoopSteps.map((step, i) => (
          <div
            key={step.letter}
            className="flex flex-col items-center text-center group"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black text-primary-foreground mb-2 shadow-md transition-transform group-hover:scale-110"
              style={{ backgroundColor: step.color }}
            >
              {step.letter}
            </div>
            <span className="text-xs font-bold text-foreground leading-tight">{step.label}</span>
            <span className="text-[10px] text-muted-foreground mt-1 leading-snug hidden sm:block">
              {step.description}
            </span>
            {i < learningLoopSteps.length - 1 && (
              <span className="hidden lg:block absolute right-0 top-1/2 text-muted-foreground/40 text-lg">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningLoopVisual;
