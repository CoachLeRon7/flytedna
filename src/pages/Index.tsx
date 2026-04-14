import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Award, ArrowRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-leadership.webp";
import logo from "@/assets/flyte-dna-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const domains = [
    {
      icon: Target,
      title: "Leadership DNA",
      description: "Core leadership identity and values",
    },
    {
      icon: TrendingUp,
      title: "Excellence",
      description: "Pursuit of continuous improvement",
    },
    {
      icon: Users,
      title: "Accountability",
      description: "Taking ownership of actions and outcomes",
    },
    {
      icon: Award,
      title: "Discipline",
      description: "Commitment to consistent effort",
    },
    {
      icon: Users,
      title: "Belonging",
      description: "Connection to team and community",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          {/* Logo removed - now in hero */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <img 
          src={heroImage} 
          alt="Leadership background" 
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black opacity-50" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <img 
            src={logo} 
            alt="FLY.TE Academy Logo" 
            width="400" 
            height="400" 
            className="h-40 md:h-64 w-auto mx-auto mb-1 md:mb-2 mt-2 md:mt-0 animate-fade-in drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:drop-shadow-[0_0_35px_rgba(251,191,36,0.7)] transition-all duration-300" 
          />
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2 md:mb-4 animate-fade-in leading-tight">
            Where Leadership Potential Transforms Into Leadership Power
          </h1>
          <p className="text-base md:text-xl text-primary-foreground/90 mb-3 md:mb-6 max-w-3xl mx-auto">
            Empowering student-athletes to develop transformational leadership through evidence-based assessment and growth planning
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-2xl mx-auto">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-semibold tracking-tight"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-background/20 backdrop-blur-sm text-primary-foreground border-2 border-primary-foreground/40 hover:bg-background/30 hover:border-primary-foreground/60 w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-semibold tracking-tight"
              onClick={() => navigate("/our-story")}
            >
              Our Story
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background/20 backdrop-blur-sm text-primary-foreground border-2 border-primary-foreground/40 hover:bg-background/30 hover:border-primary-foreground/60 w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-semibold tracking-tight"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-background/20 backdrop-blur-sm text-primary-foreground border-2 border-primary-foreground/40 hover:bg-background/30 hover:border-primary-foreground/60 w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-semibold tracking-tight"
              onClick={() => navigate("/pricing")}
            >
              View Pricing <DollarSign className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* What is FLDI */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(251,146,60,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-2 rounded-full mb-4">
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">The Framework</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What is the FLDI?
            </h2>
            <p className="text-lg text-muted-foreground">
              The Five Leadership Domains Instrument (FLDI) is a comprehensive assessment tool designed specifically for student-athletes to measure and develop their leadership capabilities across five critical dimensions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              const gradients = [
                'from-primary/10 to-primary/5 border-primary/20',
                'from-accent/10 to-accent/5 border-accent/20',
                'from-success/10 to-success/5 border-success/20',
                'from-student-accent/10 to-student-accent/5 border-student-accent/20',
                'from-coach-accent/10 to-coach-accent/5 border-coach-accent/20',
              ];
              const iconColors = [
                'text-primary',
                'text-accent',
                'text-success',
                'text-student-accent',
                'text-coach-accent',
              ];
              const iconBgs = [
                'bg-primary/20',
                'bg-accent/20',
                'bg-success/20',
                'bg-student-accent/20',
                'bg-coach-accent/20',
              ];
              return (
                <Card 
                  key={index} 
                  className={`bg-gradient-to-br ${gradients[index % gradients.length]} shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 animate-fade-in border-2`} 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className={`w-14 h-14 rounded-xl ${iconBgs[index % iconBgs.length]} flex items-center justify-center mb-4 shadow-md mx-auto`}>
                      <Icon className={`h-7 w-7 ${iconColors[index % iconColors.length]}`} />
                    </div>
                    <CardTitle className="text-foreground">{domain.title}</CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-success/5 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,146,60,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-accent/10 to-success/10 px-6 py-2 rounded-full mb-4">
              <span className="text-accent font-semibold text-sm uppercase tracking-wide">The Process</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A simple three-step process to track and enhance your leadership journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 animate-fade-in" style={{ animationDelay: '0ms' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  1
                </div>
                <CardTitle>Take Assessment</CardTitle>
                <CardDescription>
                  Complete the 30-question FLDI survey at the beginning, middle, and end of each semester
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  2
                </div>
                <CardTitle>View Results</CardTitle>
                <CardDescription>
                  Receive instant feedback with scores across all five leadership domains and your overall classification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-card hover:shadow-elegant hover:scale-105 transition-all duration-300 bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-success/80 text-success-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  3
                </div>
                <CardTitle>Create Growth Plan</CardTitle>
                <CardDescription>
                  Set actionable goals and track your progress toward transformational leadership
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Begin Your Leadership Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of student-athletes developing transformational leadership skills
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant"
            onClick={() => navigate("/auth")}
          >
            Sign Up Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FLY.TE Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;