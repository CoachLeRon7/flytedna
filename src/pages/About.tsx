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
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <img 
            src={logo} 
            alt="FLY.TE Academy Logo" 
            className="h-48 w-auto mx-auto mb-8 animate-fade-in cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in">
            Fly.te Leadership DNA
          </h1>
          <div className="inline-block bg-accent/20 backdrop-blur-sm px-8 py-3 rounded-full mb-6 animate-fade-in">
            <p className="text-2xl md:text-3xl text-primary-foreground font-bold">
              Empower. Evolve. Excel.
            </p>
          </div>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-4xl mx-auto animate-fade-in">
            Every great athlete dreams of leaving a legacy — but true greatness begins long before the scoreboard lights up.
            Fly.te Leadership DNA is more than a leadership program; it's a transformational system that helps student-athletes discover who they are, how they lead, and what it takes to elevate everyone around them.
          </p>
        </div>
      </section>

      {/* What Is Section */}
      <section className="py-20 bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-accent/10 px-6 py-2 rounded-full mb-4">
                <span className="text-accent font-semibold text-sm uppercase tracking-wide">The Framework</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                What Is Fly.te Leadership DNA?
              </h2>
              <p className="text-lg text-muted-foreground">
                Fly.te Leadership DNA is a comprehensive leadership development framework built specifically for student-athletes.
                It blends sport psychology, behavioral science, and character formation to measure and strengthen the five core components that define elite leaders:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                const colors = [
                  'bg-primary/10 border-primary/20',
                  'bg-accent/10 border-accent/20',
                  'bg-success/10 border-success/20',
                  'bg-student-accent/10 border-student-accent/20',
                  'bg-coach-accent/10 border-coach-accent/20',
                ];
                const iconColors = [
                  'text-primary',
                  'text-accent',
                  'text-success',
                  'text-student-accent',
                  'text-coach-accent',
                ];
                return (
                  <Card key={index} className={`shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105 border-2 ${colors[index % colors.length]}`}>
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl ${colors[index % colors.length]} flex items-center justify-center mb-4 shadow-md`}>
                        <Icon className={`h-7 w-7 ${iconColors[index % iconColors.length]}`} />
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

            <Card className="bg-gradient-accent border-0 shadow-elegant">
              <CardContent className="py-6 text-center">
                <p className="text-lg text-accent-foreground font-semibold italic">
                  Together, these pillars form the Fly.te Index — a developmental model that transforms leadership from a buzzword into measurable growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-success/10 px-6 py-2 rounded-full mb-4">
                <span className="text-success font-semibold text-sm uppercase tracking-wide">The Process</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                The program uses the Fly.te Leadership Development Index (FLDI) — a research-driven self and coach-assessment tool — to help athletes track leadership growth over time.
              </p>
            </div>

            <div className="space-y-6 mb-12">
              {steps.map((step, index) => {
                const bgColors = ['bg-primary', 'bg-accent', 'bg-success', 'bg-light-red'];
                const borderColors = ['border-primary/20', 'border-accent/20', 'border-success/20', 'border-light-red/20'];
                const textColors = ['text-primary-foreground', 'text-accent-foreground', 'text-success-foreground', 'text-light-red-foreground'];
                return (
                  <Card key={index} className={`shadow-card hover:shadow-elegant transition-all duration-300 border-l-4 ${borderColors[index % borderColors.length]}`}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-full ${bgColors[index % bgColors.length]} ${textColors[index % textColors.length]} flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg`}>
                          {step.number}
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2 text-foreground">{step.title}</CardTitle>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-gradient-success border-0 shadow-elegant relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <CardContent className="py-8 text-center relative z-10">
                <p className="text-2xl font-bold text-success-foreground">
                  The result? Leadership that's not accidental — but intentional, trackable, and transformational.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-success/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-primary/10 px-6 py-2 rounded-full mb-4">
                <span className="text-primary font-semibold text-sm uppercase tracking-wide">The Impact</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Why It Matters
              </h2>
              <Card className="bg-gradient-hero border-0 shadow-elegant inline-block">
                <CardContent className="py-4 px-8">
                  <p className="text-2xl font-bold text-primary-foreground">
                    Athletic talent opens doors. Leadership keeps them open.
                  </p>
                </CardContent>
              </Card>
              <p className="text-lg text-muted-foreground mt-6">
                In a world where performance is often measured by statistics, Fly.te Leadership DNA measures something deeper: the ability to influence, inspire, and serve others.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-card border-l-4 border-primary hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="text-foreground"><span className="font-bold text-primary text-lg">For student-athletes:</span><br/>A roadmap to personal mastery.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-l-4 border-accent hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-accent/5">
                <CardContent className="pt-6">
                  <p className="text-foreground"><span className="font-bold text-accent text-lg">For parents:</span><br/>A guide that ensures their child grows as a person and competitor.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-l-4 border-success hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-success/5">
                <CardContent className="pt-6">
                  <p className="text-foreground"><span className="font-bold text-success text-lg">For coaches:</span><br/>A data-informed framework for building culture and accountability.</p>
                </CardContent>
              </Card>
              <Card className="shadow-card border-l-4 border-student-accent hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-student-accent/5">
                <CardContent className="pt-6">
                  <p className="text-foreground"><span className="font-bold text-student-accent text-lg">For administrators and donors:</span><br/>Proof of impact — measurable leadership growth that translates beyond the field.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-success/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-accent/10 px-6 py-2 rounded-full mb-4">
                <span className="text-accent font-semibold text-sm uppercase tracking-wide">Real Stories</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                The Transformation in Action
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:scale-105 transition-transform duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl text-primary mb-4">"</div>
                  <p className="text-foreground italic font-medium">I learned that leadership isn't about being the loudest — it's about being the most consistent.</p>
                </CardContent>
              </Card>
              <Card className="shadow-elegant bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:scale-105 transition-transform duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl text-accent mb-4">"</div>
                  <p className="text-foreground italic font-medium">This program gave me words for what I've been trying to teach for years.</p>
                </CardContent>
              </Card>
              <Card className="shadow-elegant bg-gradient-to-br from-success/5 to-success/10 border-success/20 hover:scale-105 transition-transform duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-4xl text-success mb-4">"</div>
                  <p className="text-foreground italic font-medium">It helped our athletes take ownership of our team's culture.</p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-gradient-accent border-0 shadow-elegant">
              <CardContent className="py-6 text-center">
                <p className="text-xl text-accent-foreground font-bold">
                  Fly.te Leadership DNA isn't just shaping players — it's producing future coaches, captains, mentors, and change agents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.5),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-success/10 px-6 py-2 rounded-full mb-6">
              <span className="text-success font-semibold text-sm uppercase tracking-wide">Our Philosophy</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-8">
              The Fly.te Philosophy
            </h2>
            <Card className="bg-background/80 backdrop-blur-sm shadow-elegant mb-8">
              <CardContent className="py-8">
                <p className="text-lg text-muted-foreground mb-6">
                  At Fly.te, we believe leadership is learned through repetition, reflection, and responsibility.
                  Every assessment, workshop, and conversation is designed to empower students to evolve and excel — on the field and in life.
                </p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-elegant">
                <CardContent className="py-6">
                  <p className="text-xl font-bold text-primary-foreground">
                    This program doesn't just build leaders for today.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-accent to-accent/80 border-0 shadow-elegant">
                <CardContent className="py-6">
                  <p className="text-xl font-bold text-accent-foreground">
                    It builds transformational leaders for generations.
                  </p>
                </CardContent>
              </Card>
            </div>
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
      <section className="py-20 bg-gradient-to-br from-accent/10 via-success/10 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-primary/10 px-6 py-2 rounded-full mb-6">
            <span className="text-primary font-semibold text-sm uppercase tracking-wide">Take Action</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Join the Movement
          </h2>
          <Card className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm shadow-elegant mb-8">
            <CardContent className="py-8">
              <p className="text-lg text-muted-foreground">
                Whether you're an athlete seeking growth, a parent supporting potential, a coach building culture, or a partner ready to invest in leadership —
                Fly.te Leadership DNA invites you to rise, reflect, and take Fly.te.
              </p>
            </CardContent>
          </Card>
          <div className="inline-block bg-gradient-accent px-10 py-4 rounded-full mb-8 shadow-elegant">
            <p className="text-2xl font-bold text-accent-foreground">
              → Empower. Evolve. Excel.
            </p>
          </div>
          <div>
            <Button 
              size="lg" 
              className="bg-success hover:bg-success/90 text-success-foreground shadow-elegant text-lg px-8 py-6 animate-pulse hover:animate-none hover:scale-110 transition-transform"
              onClick={() => navigate("/auth")}
            >
              Get Started Today
            </Button>
          </div>
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
