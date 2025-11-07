import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import { guardianQuestions, guardianDomainDescriptions } from "@/lib/guardianAssessmentQuestions";

export default function GuardianAssessment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [athleteInfo, setAthleteInfo] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      toast.error("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data: invitationData, error: invError } = await supabase
        .from("guardian_assessments")
        .select("*, profiles!guardian_assessments_athlete_id_fkey(first_name, last_name)")
        .eq("invitation_token", token)
        .maybeSingle();

      if (invError) throw invError;

      if (!invitationData) {
        toast.error("Invitation not found or expired");
        setLoading(false);
        return;
      }

      if (invitationData.completed_at) {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      setInvitation(invitationData);
      setAthleteInfo(invitationData.profiles);
    } catch (error: any) {
      console.error("Error loading invitation:", error);
      toast.error("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const allAnswered = guardianQuestions.every(q => responses[q.id]);
    if (!allAnswered) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("guardian_assessments")
        .update({
          ...responses,
          optional_comment: comment || null,
          completed_at: new Date().toISOString(),
        })
        .eq("invitation_token", token);

      if (error) throw error;

      toast.success("Assessment submitted successfully!");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your feedback has been submitted successfully. Your insights will help {athleteInfo?.first_name} develop their leadership skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.close()} variant="outline" className="w-full">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentDomain = guardianQuestions[0]?.domain;
  const groupedQuestions = guardianQuestions.reduce((acc, q) => {
    if (!acc[q.domain]) acc[q.domain] = [];
    acc[q.domain].push(q);
    return acc;
  }, {} as Record<string, typeof guardianQuestions>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Leadership Assessment</h1>
          <p className="text-muted-foreground">
            Feedback for {athleteInfo?.first_name} {athleteInfo?.last_name}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {invitation.guardian_name} ({invitation.guardian_relationship})
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              Please rate each statement on a scale of 1 to 5, where:
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>1 = Strongly Disagree</span>
                  <span>5 = Strongly Agree</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        {Object.entries(groupedQuestions).map(([domain, questions]) => (
          <Card key={domain} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {domain}
              </CardTitle>
              <CardDescription>
                {guardianDomainDescriptions[domain as keyof typeof guardianDomainDescriptions]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-normal leading-relaxed">
                    {question.text}
                  </Label>
                  <RadioGroup
                    value={responses[question.id]?.toString() || ""}
                    onValueChange={(value) =>
                      setResponses({ ...responses, [question.id]: parseInt(value) })
                    }
                  >
                    <div className="flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-2">
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                          <Label
                            htmlFor={`${question.id}-${value}`}
                            className="text-xs text-muted-foreground cursor-pointer"
                          >
                            {value}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Comments (Optional)</CardTitle>
            <CardDescription>
              Share any additional observations or context about {athleteInfo?.first_name}'s leadership development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Your comments here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(responses).length !== guardianQuestions.length}
            size="lg"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
