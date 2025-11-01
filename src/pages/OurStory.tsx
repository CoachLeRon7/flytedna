import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Target, TrendingUp, Heart, Calendar, BookOpen, Award } from "lucide-react";
import logo from "@/assets/flyte-academy-logo.png";
import founderPhoto from "@/assets/founder-photo.jpg";

const OurStory = () => {
  useEffect(() => {
    document.title = "Our Story - FLY.TE Academy";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-red-950 via-red-900 to-red-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,28,28,0.1),transparent_70%)]" />
        
        <div className="container relative z-10 mx-auto px-4 py-12">
          <Link to="/" className="inline-block mb-8 animate-fade-in">
            <img src={logo} alt="FLY.TE Academy Logo" className="h-48 w-auto" />
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Our Story — Why Leadership Matters
            </h1>
            <p className="text-xl md:text-2xl text-white/90 animate-fade-in" style={{ animationDelay: '100ms' }}>
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
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-red-100 text-red-800 border-red-200">
              <Target className="mr-2 h-4 w-4" />
              Where It All Began
            </Badge>
            
            <Card className="mb-8 shadow-lg border-l-4 border-red-700 bg-white">
              <CardContent className="p-8">
                <blockquote className="text-2xl md:text-3xl font-semibold text-slate-800 italic">
                  "Talent can take you far, but leadership determines how far you'll take yourself and others."
                </blockquote>
              </CardContent>
            </Card>

            <div className="space-y-6 text-lg text-slate-700">
              <p>
                I've been around sports my entire life as an athlete, a coach, and now as someone dedicated to developing athletic leaders.
              </p>
              <p>
                There was a moment that changed everything for me:
              </p>
              <p className="font-medium text-slate-900">
                I realized that talent can take you far, but leadership determines how far you'll take yourself and others.
              </p>
              <p>
                Over the years, I've watched gifted athletes fade under pressure and quiet ones rise to lead when it mattered most. The difference wasn't skill alone, it was the consistent and relentless pursuit of excellence.
              </p>
            </div>

            <Card className="mt-8 bg-white border-2 border-red-200 shadow-lg">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-slate-900 mb-4">
                  That realization sparked the creation of the Fly.te Leadership Development Index (FLDI) — a system designed to help student-athletes see themselves clearly, grow intentionally, and lead authentically.
                </p>
                <p className="text-lg text-slate-700">
                  Fly.teDNA was born out of one simple but powerful belief:
                </p>
                <p className="text-2xl font-bold text-red-800 mt-4">
                  Performance means little without purpose.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Background Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-100 text-orange-700 border-orange-200">
              <Award className="mr-2 h-4 w-4" />
              The Person Behind the Vision
            </Badge>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <div className="space-y-6 text-lg text-slate-700">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  LeRon Williams
                </h2>
                <p className="text-xl font-semibold text-red-800">
                  Founder of Fly.te Athletics and creator of the Fly.te Leadership Development Index
                </p>
                <p>
                  My journey began on the track, as a collegiate All-American long jumper who learned that leadership wasn't about medals, but about mindset.
                </p>
                <p>
                  After years in athletics and higher education — coaching, mentoring, and directing multicultural and leadership programs — I saw a common thread:
                </p>
                <p className="font-medium text-slate-900">
                  Young people needed more than motivation; they needed leadership.
                </p>
              </div>
              <div className="relative">
                <img 
                  src={founderPhoto} 
                  alt="LeRon Williams - Founder of Fly.te Athletics" 
                  className="aspect-square rounded-lg border-2 border-red-200 shadow-lg object-cover w-full"
                />
              </div>
            </div>

            <Card className="shadow-lg border-l-4 border-red-700 hover:scale-105 transition-all duration-300 bg-white">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-slate-900">
                  I built Fly.teDNA to merge my two worlds — athletic performance and leadership psychology — giving student-athletes the tools to understand who they are beyond the scoreboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Evolution Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-green-100 text-green-700 border-green-200">
              <TrendingUp className="mr-2 h-4 w-4" />
              From Vision to Framework
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
              Mission Evolution
            </h2>

            <div className="space-y-6 text-lg text-slate-700 mb-8">
              <p>
                What started as a simple leadership conversation with athletes and professors, grew into a structured, research-informed system of development.
              </p>
              <p>
                Fly.teDNA began as a few workshop ideas and a spreadsheet of leadership traits. It evolved into a data-driven tool — the Fly.te Leadership Development Index (FLDI) — now used to measure the intangibles that define great leaders.
              </p>
            </div>

            <Card className="mb-6 bg-white border-2 border-red-200 shadow-lg">
              <CardContent className="p-8">
                <p className="text-2xl font-bold text-red-800 mb-4">
                  The mission has stayed the same:
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  to bridge the gap between performance and personal growth.
                </p>
              </CardContent>
            </Card>

            <p className="text-lg text-slate-700">
              But the tools have evolved — from coaching sessions and camp workshops to a full digital platform with leadership assessments, growth profiles, and 360° feedback options for student-athletes and teams.
            </p>
          </div>
        </div>
      </section>

      {/* Key Milestones Timeline Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200">
              <Calendar className="mr-2 h-4 w-4" />
              Our Journey
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12">
              Key Milestones
            </h2>

            <div className="space-y-8">
              <Card className="shadow-md border-l-4 border-red-700 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-red-800 text-white shrink-0">2023</Badge>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">The Beginning</p>
                      <p className="text-slate-700">
                        The idea for Fly.teDNA was born during leadership sessions with WIU student-athletes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-orange-600 text-white shrink-0">2024</Badge>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Framework Development</p>
                      <p className="text-slate-700">
                        Development of the Fly.te Leadership Development Index (FLDI) — a 30-question assessment designed to measure leadership traits like accountability, awareness, and growth mindset.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" style={{ animationDelay: '200ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-green-600 text-white shrink-0">2025</Badge>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Pilot Programs</p>
                      <p className="text-slate-700">
                        Pilot programs launched with Western Illinois University athletic teams to measure athlete leadership DNA in real team environments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-l-4 border-red-700 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" style={{ animationDelay: '300ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-red-800 text-white shrink-0">2026</Badge>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Academy Expansion</p>
                      <p className="text-slate-700">
                        Expansion through Fly.te Academy, integrating academic, athletic, and leadership development into one holistic model for youth athletes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 animate-fade-in bg-white" style={{ animationDelay: '400ms' }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-purple-600 text-white shrink-0">Next</Badge>
                    <div>
                      <p className="text-lg font-semibold text-slate-900 mb-2">Digital Platform</p>
                      <p className="text-slate-700">
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

      {/* Personal Anecdotes Section - HIDDEN until actual quotes are available */}
      {/* <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-red-100 text-red-700 border-red-200">
              <Heart className="mr-2 h-4 w-4" />
              Why This Work Matters
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
              I've watched athletes transform...
            </h2>

            <p className="text-lg text-slate-700 mb-8">
              ...not because they became more talented, but because they became more aware.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-lg bg-white border-2 border-red-200 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-red-200 mb-4">"</div>
                  <p className="text-lg font-semibold text-slate-900">
                    I've seen the quiet athlete find her voice.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white border-2 border-orange-200 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-orange-200 mb-4">"</div>
                  <p className="text-lg font-semibold text-slate-900">
                    The frustrated player turn feedback into fuel.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white border-2 border-green-200 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-6xl text-green-200 mb-4">"</div>
                  <p className="text-lg font-semibold text-slate-900">
                    The confident captain learn humility and grow even stronger.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg bg-white border-2 border-red-200">
              <CardContent className="p-8">
                <p className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                  Those are the moments that remind me why Fly.teDNA matters.
                </p>
                <p className="text-lg text-slate-700 italic">
                  Because leadership isn't built in the spotlight — it's forged in reflection, accountability, and action.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* Research Foundation Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200">
              <BookOpen className="mr-2 h-4 w-4" />
              Research-Backed Framework
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
              Research Foundation
            </h2>

            <p className="text-lg text-slate-700 mb-8">
              Fly.teDNA is grounded in the principles of leadership development, feedback theory, and student-athlete identity research.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md border-2 border-red-200 hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-red-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Kegan's Constructive Developmental Theory
                  </h3>
                  <p className="text-sm text-slate-700">
                    Focusing on how people grow through reflection and meaning-making.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md border-2 border-orange-200 hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Astin's Input-Environment-Output Model
                  </h3>
                  <p className="text-sm text-slate-700">
                    Emphasizing how experiences shape student outcomes.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md border-2 border-green-200 hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Abes, Jones & McEwen's Model
                  </h3>
                  <p className="text-sm text-slate-700">
                    Supporting holistic growth beyond athletic identity.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg bg-white border-2 border-blue-200">
              <CardContent className="p-8">
                <p className="text-xl font-semibold text-slate-900">
                  The FLDI blends these academic frameworks with the real-world insights of coaching and performance training, offering a balanced approach to leadership development that is both personal and measurable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)]" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Movement
            </h2>
            <p className="text-xl md:text-2xl text-white/95 mb-8">
              Leadership isn't just a destination — it becomes who you are. A Leader
            </p>
            
            <div className="space-y-6 text-lg text-white/90 mb-8">
              <p>
                Fly.teDNA exists to help student-athletes, coaches, and teams grow through feedback, reflection, and accountability.
              </p>
              <p>
                We're building a culture where leadership is developed with the same precision as performance — through consistent, intentional action.
              </p>
              <p className="font-medium text-white">
                Whether you're a coach looking to strengthen team culture or a student-athlete ready to discover your leadership potential — this is your invitation to grow with us.
              </p>
              <p className="italic">
                Because true leadership isn't measured in words — it's built through consistent and intentional action.
              </p>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-white mb-8">
              Come take Fly.te with us.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="secondary" className="bg-white hover:bg-slate-100 text-blue-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600">
            © 2025 FLY.TE Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OurStory;
