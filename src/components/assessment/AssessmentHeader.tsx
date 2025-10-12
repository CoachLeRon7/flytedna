import logo from "@/assets/flyte-academy-logo.png";

export const AssessmentHeader = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <img src={logo} alt="FLY.TE Academy" width="48" height="48" className="h-12 w-auto" />
          <div className="text-right">
            <h1 className="text-3xl font-bold text-foreground font-cooper">
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
