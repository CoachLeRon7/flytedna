import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Award, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/flyte-academy-logo.png";

const About = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Target,
      title: "Leadership DNA",
      description: "Courage, influence, and integrity in action.",
    },
    {
      icon: TrendingUp,
      title: "Excellence",
      description: "The relentless pursuit of growth through discipline and self-reflection.",
    },
    {
      icon: Users,
      title: "Accountability",
      description: "Ownership over choices, effort, and impact.",
    },
    {
      icon: Award,
      title: "Discipline",
      description: "Consistency and self-mastery that sustain performance.",
    },
    {
      icon: Heart,
      title: "Belonging & Impact",
      description: "The power to create connection, purpose, and legacy.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Assessment",
      description: "Student-athletes complete a 30-item transformational leadership questionnaire, reflecting on how they lead under pressure, respond to feedback, and influence their environment.",
    },
    {
      number: "2",
      title: "Results Dashboard",
      description: "Each athlete receives a personalized \"Leadership Profile\" that identifies their strengths, growth areas, and actionable insights.",
    },
    {
      number: "3",
      title: "Growth Plan",
      description: "Athletes then create a semester-long plan with goals, action steps, and reflection milestones.",
    },
    {
      number: "4",
      title: "Coach & Team Integration",
      description: "Coaches access team-level dashboards to guide conversations, track progress, and build intentional leadership cultures.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <img src={logo} alt="FLY.TE Academy Logo" className="h-48 w-auto mx-auto mb-8" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            Fly.te Leadership DNA
          </h1>
          <p className="text-2xl md:text-3xl text-primary-foreground/90 font-semibold mb-4">
            Empower. Evolve. Excel.
          </p>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-4xl mx-auto">
            Every great athlete dreams of leaving a legacy — but true greatness begins long before the scoreboard lights up.
            Fly.te Leadership DNA is more than a leadership program; it's a transformational system that helps student-athletes discover who they are, how they lead, and what it takes to elevate everyone around them.
          </p>
        </div>
      </section>

      {/* What Is Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              What Is Fly.te Leadership DNA?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Fly.te Leadership DNA is a comprehensive leadership development framework built specifically for student-athletes.
              It blends sport psychology, behavioral science, and character formation to measure and strengthen the five core components that define elite leaders:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg text-foreground">{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-lg text-muted-foreground text-center italic">
              Together, these pillars form the Fly.te Index — a developmental model that transforms leadership from a buzzword into measurable growth.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground mb-12 text-center">
              The program uses the Fly.te Leadership Development Index (FLDI) — a research-driven self and coach-assessment tool — to help athletes track leadership growth over time.
            </p>

            <div className="space-y-6 mb-12">
              {steps.map((step, index) => (
                <Card key={index} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {step.number}
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-hero border-0 shadow-elegant">
              <CardContent className="py-8 text-center">
                <p className="text-xl font-semibold text-primary-foreground">
                  The result? Leadership that's not accidental — but intentional, trackable, and transformational.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-6 text-center">
              Why It Matters
            </h2>
            <p className="text-2xl text-center font-semibold text-primary mb-8">
              Athletic talent opens doors. Leadership keeps them open.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              In a world where performance is often measured by statistics, Fly.te Leadership DNA measures something deeper: the ability to influence, inspire, and serve others.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">For student-athletes:</span> A roadmap to personal mastery.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">For parents:</span> A guide that ensures their child grows as a person and competitor.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">For coaches:</span> A data-informed framework for building culture and accountability.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground"><span className="font-semibold text-foreground">For administrators and donors:</span> Proof of impact — measurable leadership growth that translates beyond the field.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              The Transformation in Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">"I learned that leadership isn't about being the loudest — it's about being the most consistent."</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">"This program gave me words for what I've been trying to teach for years."</p>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground italic">"It helped our athletes take ownership of our team's culture."</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-lg text-center mt-8 text-foreground font-semibold">
              Fly.te Leadership DNA isn't just shaping players — it's producing future coaches, captains, mentors, and change agents.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              The Fly.te Philosophy
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              At Fly.te, we believe leadership is learned through repetition, reflection, and responsibility.
              Every assessment, workshop, and conversation is designed to empower students to evolve and excel — on the field and in life.
            </p>
            <p className="text-xl font-semibold text-primary mb-4">
              This program doesn't just build leaders for today.
            </p>
            <p className="text-xl font-semibold text-primary">
              It builds transformational leaders for generations.
            </p>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6 text-center">
              For Sponsors & Partners
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 text-center">
              Supporting Fly.te Leadership DNA means investing in the next generation of disciplined, purpose-driven leaders.
              Your partnership helps:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <CardContent className="pt-6">
                  <p className="text-primary-foreground">Fund student scholarships for leadership training.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <CardContent className="pt-6">
                  <p className="text-primary-foreground">Provide access to technology that tracks leadership development.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/10 backdrop-blur-sm border-primary-foreground/20">
                <CardContent className="pt-6">
                  <p className="text-primary-foreground">Empower underrepresented athletes through mentorship and development opportunities.</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-lg text-center text-primary-foreground font-semibold">
              Every contribution fuels the mission to create leaders worth following.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Join the Movement
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Whether you're an athlete seeking growth, a parent supporting potential, a coach building culture, or a partner ready to invest in leadership —
            Fly.te Leadership DNA invites you to rise, reflect, and take Fly.te.
          </p>
          <p className="text-2xl font-bold text-primary mb-8">
            → Empower. Evolve. Excel.
          </p>
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant"
            onClick={() => navigate("/auth")}
          >
            Get Started Today
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

export default About;
