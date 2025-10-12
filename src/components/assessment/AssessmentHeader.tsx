import logo from "@/assets/flyte-academy-logo.png";

export const AssessmentHeader = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <img src={logo} alt="FLY.TE Academy" className="h-12 w-auto" />
          <div className="text-right">
            <h1 className="text-xl font-bold text-foreground">
              FLDI – Transformational Edition
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Be honest. Growth beats perfection.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
