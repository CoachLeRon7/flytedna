import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-leadership.jpg";
import logo from "@/assets/flyte-academy-logo.png";

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
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <img src={logo} alt="FLY.TE Academy Logo" className="h-72 w-auto mx-auto mb-8 animate-fade-in" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
            Five Leadership Domains
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Empowering student-athletes to develop transformational leadership through evidence-based assessment and growth planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant"
              onClick={() => navigate("/auth")}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background/20 backdrop-blur-sm text-primary-foreground border-primary-foreground/30 hover:bg-background/30"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* What is FLDI */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
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
              return (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A simple three-step process to track and enhance your leadership journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center shadow-card">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <CardTitle>Take Assessment</CardTitle>
                <CardDescription>
                  Complete the 30-question FLDI survey at the beginning, middle, and end of each semester
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-card">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <CardTitle>View Results</CardTitle>
                <CardDescription>
                  Receive instant feedback with scores across all five leadership domains and your overall classification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center shadow-card">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
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