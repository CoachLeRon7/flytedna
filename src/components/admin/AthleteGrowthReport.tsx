import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getQuestionsForAge, getDomainLabel, type DomainQuestions } from "@/lib/assessmentQuestions";
import { getCoachingTip, getAgeGroup, type CoachingTip } from "@/lib/coachingRecommendations";
import { AlertCircle, TrendingDown, Lightbulb, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface AthleteGrowthReportProps {
  userId: string;
}

interface AssessmentData {
  id: string;
  user_id: string;
  composite_mean: number;
  classification: string;
  timepoint: string;
  semester_label: string;
  created_at: string;
  // Individual question scores
  l1?: number; l2?: number; l3?: number; l4?: number; l5?: number; l6?: number;
  e1?: number; e2?: number; e3?: number; e4?: number; e5?: number; e6?: number;
  a1?: number; a2?: number; a3?: number; a4?: number; a5?: number; a6?: number;
  d1?: number; d2?: number; d3?: number; d4?: number; d5?: number; d6?: number;
  b1?: number; b2?: number; b3?: number; b4?: number; b5?: number; b6?: number;
  // Domain means
  leadership_dna_mean?: number;
  excellence_mean?: number;
  accountability_mean?: number;
  discipline_mean?: number;
  belonging_mean?: number;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  team_id: string | null;
}

interface QuestionScore {
  domain: string;
  questionKey: string;
  questionNumber: number;
  questionText: string;
  score: number;
  isReversed: boolean;
  coachingTip?: CoachingTip;
}

export function AthleteGrowthReport({ userId }: AthleteGrowthReportProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [age, setAge] = useState<number | null>(null);
  const [questionScores, setQuestionScores] = useState<QuestionScore[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, date_of_birth, team_id')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Calculate age
      let calculatedAge = null;
      if (profileData.date_of_birth) {
        const birthDate = new Date(profileData.date_of_birth);
        const today = new Date();
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
      }
      setAge(calculatedAge);

      // Fetch latest assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      // Process question scores
      if (assessmentData && calculatedAge !== null) {
        const questions = getQuestionsForAge(calculatedAge);
        const ageGroup = getAgeGroup(calculatedAge);
        const scores: QuestionScore[] = [];

        // Process each domain
        const domains: (keyof DomainQuestions)[] = ['L', 'E', 'A', 'D', 'B'];
        domains.forEach(domain => {
          const domainQuestions = questions[domain];
          domainQuestions.forEach((q, index) => {
            const questionNumber = index + 1;
            const questionKey = `${domain.toLowerCase()}${questionNumber}`;
            const score = assessmentData[questionKey as keyof AssessmentData] as number | undefined;

            if (score !== undefined && score !== null) {
              const coachingTip = getCoachingTip(domain, questionNumber, ageGroup);
              
              scores.push({
                domain: getDomainLabel(domain),
                questionKey: `${domain}${questionNumber}`,
                questionNumber,
                questionText: q.text,
                score,
                isReversed: q.reversed || false,
                coachingTip
              });
            }
          });
        });

        // Sort by score (ascending) to show lowest scores first
        scores.sort((a, b) => a.score - b.score);
        setQuestionScores(scores);
      }

    } catch (error) {
      console.error('Error loading growth report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 2) return "text-destructive";
    if (score === 3) return "text-orange-500";
    return "text-muted-foreground";
  };

  const getScoreBadgeVariant = (score: number): "destructive" | "secondary" | "outline" => {
    if (score <= 2) return "destructive";
    if (score === 3) return "secondary";
    return "outline";
  };

  const lowScoringQuestions = questionScores.filter(q => q.score <= 3);
  const domainGroups = questionScores.reduce((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = [];
    acc[q.domain].push(q);
    return acc;
  }, {} as Record<string, QuestionScore[]>);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!profile || !assessment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No assessment data found for this athlete.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {profile.first_name} {profile.last_name} - Growth Report
              </CardTitle>
              <CardDescription>
                {assessment.timepoint} Assessment • {assessment.semester_label} • Age: {age || 'Unknown'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{assessment.composite_mean?.toFixed(2)}</div>
              <Badge variant="outline" className="mt-1">{assessment.classification}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lowest Scoring Questions */}
      {lowScoringQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Priority Growth Areas</CardTitle>
            </div>
            <CardDescription>
              Questions scoring 3 or below require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowScoringQuestions.map((q, idx) => (
              <div key={idx} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{q.domain}</Badge>
                      <Badge variant={getScoreBadgeVariant(q.score)}>Score: {q.score}/5</Badge>
                      {q.isReversed && (
                        <Badge variant="secondary" className="text-xs">Reverse-Scored</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{q.questionText}</p>
                    {q.isReversed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ⚠️ Lower score indicates better performance on this question
                      </p>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(q.score)}`}>
                    {q.score}
                  </div>
                </div>

                {q.coachingTip && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Lightbulb className="h-4 w-4" />
                      View Coaching Recommendations
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3 space-y-3">
                      <div className="bg-muted p-4 rounded-md space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Coaching Focus</p>
                          <p className="text-sm">{q.coachingTip.coachingFocus}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">What It Looks Like</p>
                          <p className="text-sm">{q.coachingTip.whatItLooksLike}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Action Steps
                          </p>
                          <ul className="space-y-2">
                            {q.coachingTip.actionSteps.map((step, i) => (
                              <li key={i} className="text-sm flex gap-2">
                                <span className="text-primary font-medium">{i + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Conversation Starters
                          </p>
                          <ul className="space-y-2">
                            {q.coachingTip.conversationStarters.map((starter, i) => (
                              <li key={i} className="text-sm italic text-muted-foreground flex gap-2">
                                <span>"</span>
                                <span>{starter}</span>
                                <span>"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Domain-Specific Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Complete Domain Breakdown</h2>
        
        {Object.entries(domainGroups).map(([domain, questions]) => {
          const domainMean = assessment[`${domain.toLowerCase().replace(' & impact', '').replace(' dna', '_dna').replace(/\s+/g, '_')}_mean` as keyof AssessmentData] as number | undefined;
          const growthQuestions = questions.filter(q => q.score <= 3);

          return (
            <Card key={domain}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{domain}</CardTitle>
                  <Badge variant="outline" className="text-base">
                    Domain Average: {domainMean?.toFixed(2) || 'N/A'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {growthQuestions.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                      {growthQuestions.length} question{growthQuestions.length > 1 ? 's' : ''} in this domain scoring ≤3
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{q.questionKey}</span>
                          <Badge variant={getScoreBadgeVariant(q.score)} className="text-xs">
                            {q.score}/5
                          </Badge>
                          {q.isReversed && (
                            <Badge variant="secondary" className="text-xs">←</Badge>
                          )}
                        </div>
                        <p className="text-sm">{q.questionText}</p>
                      </div>
                      <div className={`text-xl font-bold ${getScoreColor(q.score)} min-w-[3rem] text-right`}>
                        {q.score}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
