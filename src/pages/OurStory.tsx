import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Target, TrendingUp, Heart, Calendar, BookOpen, Award } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";

const OurStory = () => {
  useEffect(() => {
    document.title = "Our Story - FLY.TE Academy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.15),transparent_50%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-12">
          <Link to="/" className="inline-block mb-8 animate-fade-in">
            <img src={logo} alt="FLY.TE Academy Logo" className="h-48 w-auto" />
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              Our Story — Why Leadership Matters
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Performance means little without purpose.
            </p>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <Link to="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </section>

      {/* Founding Story Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-accent/10 text-accent-foreground border-accent/20">
              <Target className="mr-2 h-4 w-4" />
              Where It All Began
            </Badge>
            
            <Card className="mb-8 shadow-elegant border-l-4 border-accent">
              <CardContent className="p-8">
                <blockquote className="text-2xl md:text-3xl font-semibold text-foreground italic">
                  "Talent can take you far, but leadership determines how far you'll take yourself and others."
                </blockquote>
              </CardContent>
            </Card>

            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                I've been around sports my entire life as an athlete, a coach, and now as someone dedicated to developing athletic leaders.
              </p>
              <p>
                There was a moment that changed everything for me:
              </p>
              <p className="font-medium text-foreground">
                I realized that talent can take you far, but leadership determines how far you'll take yourself and others.
              </p>
              <p>
                Over the years, I've watched gifted athletes fade under pressure and quiet ones rise to lead when it mattered most. The difference wasn't skill alone — it was self-awareness, accountability, and the relentless drive to grow.
              </p>
            </div>

            <Card className="mt-8 bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 shadow-elegant">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-foreground mb-4">
                  That realization sparked the creation of the Fly.te Leadership Development Index (FLDI) — a system designed to help student-athletes see themselves clearly, grow intentionally, and lead authentically.
                </p>
                <p className="text-lg text-muted-foreground">
                  Fly.teDNA was born out of one simple but powerful belief:
                </p>
                <p className="text-2xl font-bold text-primary mt-4">
                  Performance means little without purpose.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Background Section */}
      <section className="py-20 bg-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,hsl(var(--success)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary-foreground border-primary/20">
              <Award className="mr-2 h-4 w-4" />
              The Person Behind the Vision
            </Badge>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <div className="space-y-6 text-lg text-muted-foreground">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  LeRon Williams
                </h2>
                <p className="text-xl font-semibold text-primary">
                  Founder of Fly.te Athletics and creator of the Fly.te Leadership Development Index
                </p>
                <p>
                  My journey began on the track, as a collegiate All-American long jumper who learned that leadership wasn't about medals, but about mindset.
                </p>
                <p>
                  After years in athletics and higher education — coaching, mentoring, and directing multicultural and leadership programs — I saw a common thread:
                </p>
                <p className="font-medium text-foreground">
                  Young people needed more than motivation; they needed leadership.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 shadow-elegant flex items-center justify-center">
                  <Award className="h-24 w-24 text-primary/40" />
                </div>
              </div>
            </div>

            <Card className="shadow-elegant border-l-4 border-primary hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-foreground">
                  I built Fly.teDNA to merge my two worlds — athletic performance and leadership psychology — giving student-athletes the tools to understand who they are beyond the scoreboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Evolution Section */}
      <section className="py-20 bg-gradient-to-br from-success/10 via-background to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-success/10 text-success-foreground border-success/20">
              <TrendingUp className="mr-2 h-4 w-4" />
              From Vision to Framework
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Mission Evolution
            </h2>

            <div className="space-y-6 text-lg text-muted-foreground mb-8">
              <p>
                What started as a simple leadership conversation with athletes and professors, grew into a structured, research-informed system of development.
              </p>
              <p>
                Fly.teDNA began as a few workshop ideas and a spreadsheet of leadership traits. It evolved into a data-driven tool — the Fly.te Leadership Development Index (FLDI) — now used to measure the intangibles that define great leaders.
              </p>
            </div>

            <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 shadow-elegant">
              <CardContent className="p-8">
                <p className="text-2xl font-bold text-primary mb-4">
                  The mission has stayed the same:
                </p>
                <p className="text-xl font-semibold text-foreground">
                  to bridge the gap between performance and personal growth.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-muted-foreground">
              But the tools have evolved — from coaching sessions and camp workshops to a full digital platform with leadership assessments, growth profiles, and 360° feedback options for student-athletes and teams.
            </p>
          </div>
        </div>
      </section>

      {/* Key Milestones Timeline Section */}
      <section className="py-20 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-accent/10 text-accent-foreground border-accent/20">
              <Calendar className="mr-2 h-4 w-4" />
              Our Journey
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
              Key Milestones
            </h2>

            <div className="space-y-8">
              <Card className="shadow-card border-l-4 border-primary hover:shadow-elegant transition-all duration-300 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-primary text-primary-foreground shrink-0">2023</Badge>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">The Beginning</p>
                      <p className="text-muted-foreground">
                        The idea for Fly.teDNA was born during leadership sessions with WIU student-athletes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-l-4 border-accent hover:shadow-elegant transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-accent text-accent-foreground shrink-0">2024</Badge>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Framework Development</p>
                      <p className="text-muted-foreground">
                        Development of the Fly.te Leadership Development Index (FLDI) — a 30-question assessment designed to measure leadership traits like accountability, awareness, and growth mindset.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-l-4 border-success hover:shadow-elegant transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-success text-success-foreground shrink-0">2025</Badge>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Pilot Programs</p>
                      <p className="text-muted-foreground">
                        Pilot programs launched with Western Illinois University athletic teams to measure athlete leadership DNA in real team environments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-l-4 border-primary hover:shadow-elegant transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-primary text-primary-foreground shrink-0">2026</Badge>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Academy Expansion</p>
                      <p className="text-muted-foreground">
                        Expansion through Fly.te Academy, integrating academic, athletic, and leadership development into one holistic model for youth athletes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-l-4 border-accent hover:shadow-elegant transition-all duration-300 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-accent text-accent-foreground shrink-0">Next</Badge>
                    <div>
                      <p className="text-lg font-semibold text-foreground mb-2">Digital Platform</p>
                      <p className="text-muted-foreground">
                        Full integration into a mobile-friendly portal where athletes, coaches, and parents can track leadership growth in real time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Anecdotes Section */}
      <section className="py-20 bg-gradient-to-br from-accent/5 via-success/5 to-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-success/10 text-success-foreground border-success/20">
              <Heart className="mr-2 h-4 w-4" />
              Why This Work Matters
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              I've watched athletes transform...
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              ...not because they became more talented, but because they became more aware.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-elegant bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-primary/20 mb-4">"</div>
                  <p className="text-lg font-semibold text-foreground">
                    I've seen the quiet athlete find her voice.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-accent/20 mb-4">"</div>
                  <p className="text-lg font-semibold text-foreground">
                    The frustrated player turn feedback into fuel.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-success/20 mb-4">"</div>
                  <p className="text-lg font-semibold text-foreground">
                    The confident captain learn humility and grow even stronger.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
              <CardContent className="p-8">
                <p className="text-xl md:text-2xl font-bold text-foreground mb-4">
                  Those are the moments that remind me why Fly.teDNA matters.
                </p>
                <p className="text-lg text-muted-foreground italic">
                  Because leadership isn't built in the spotlight — it's forged in reflection, accountability, and action.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Foundation Section */}
      <section className="py-20 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--success)/0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary-foreground border-primary/20">
              <BookOpen className="mr-2 h-4 w-4" />
              Research-Backed Framework
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Research Foundation
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Fly.teDNA is grounded in the principles of leadership development, feedback theory, and student-athlete identity research.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card border-2 border-primary/20 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Kegan's Constructive Developmental Theory
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Focusing on how people grow through reflection and meaning-making.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-2 border-accent/20 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Astin's Input-Environment-Output Model
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Emphasizing how experiences shape student outcomes.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card border-2 border-success/20 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Abes, Jones & McEwen's Model
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supporting holistic growth beyond athletic identity.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-foreground">
                  The FLDI blends these academic frameworks with the real-world insights of coaching and performance training, offering a balanced approach to leadership development that is both personal and measurable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.2),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Join the Movement
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8">
              Leadership isn't just a destination — it becomes who you are. A Leader
            </p>
            
            <div className="space-y-6 text-lg text-primary-foreground/80 mb-8">
              <p>
                Fly.teDNA exists to help student-athletes, coaches, and teams grow through feedback, reflection, and accountability.
              </p>
              <p>
                We're building a culture where leadership is developed with the same precision as performance — through consistent, intentional action.
              </p>
              <p className="font-medium text-primary-foreground">
                Whether you're a coach looking to strengthen team culture or a student-athlete ready to discover your leadership potential — this is your invitation to grow with us.
              </p>
              <p className="italic">
                Because true leadership isn't measured in words — it's built through consistent and intentional action.
              </p>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-primary-foreground mb-8">
              Come take Fly.te with us.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="secondary">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 FLY.TE Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OurStory;
