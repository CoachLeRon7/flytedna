import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PeerAssessmentDomainSection } from "@/components/peer/PeerAssessmentDomainSection";

const peerAssessmentSchema = z.object({
  l1: z.number().min(1).max(5),
  l2: z.number().min(1).max(5),
  l3: z.number().min(1).max(5),
  e1: z.number().min(1).max(5),
  e2: z.number().min(1).max(5),
  e3: z.number().min(1).max(5),
  a1: z.number().min(1).max(5),
  a2: z.number().min(1).max(5),
  a3: z.number().min(1).max(5),
  d1: z.number().min(1).max(5),
  d2: z.number().min(1).max(5),
  d3: z.number().min(1).max(5),
  b1: z.number().min(1).max(5),
  b2: z.number().min(1).max(5),
  b3: z.number().min(1).max(5),
  optional_comment: z.string().optional(),
});

type PeerAssessmentFormData = z.infer<typeof peerAssessmentSchema>;

export default function PeerAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessedUserId = searchParams.get("user_id");
  const timepoint = searchParams.get("timepoint") as "pre" | "mid" | "end";
  const semesterLabel = searchParams.get("semester");

  const [loading, setLoading] = useState(false);
  const [assessedUser, setAssessedUser] = useState<{ first_name: string; last_name: string } | null>(null);

  const form = useForm<PeerAssessmentFormData>({
    resolver: zodResolver(peerAssessmentSchema),
  });

  useEffect(() => {
    if (!assessedUserId || !timepoint || !semesterLabel) {
      toast.error("Missing assessment parameters");
      navigate("/dashboard");
      return;
    }

    const fetchAssessedUser = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", assessedUserId)
        .single();

      if (data) {
        setAssessedUser(data);
      }
    };

    fetchAssessedUser();
  }, [assessedUserId, timepoint, semesterLabel, navigate]);

  const onSubmit = async (data: PeerAssessmentFormData) => {
    if (!assessedUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("peer_assessments").insert([
        {
          assessor_id: (await supabase.auth.getUser()).data.user?.id,
          assessed_user_id: assessedUserId,
          timepoint,
          semester_label: semesterLabel,
          ...data,
        },
      ]);

      if (error) throw error;

      toast.success("Peer assessment submitted successfully! Your feedback is anonymous.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting peer assessment:", error);
      toast.error(error.message || "Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  if (!assessedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Peer Assessment</CardTitle>
          <CardDescription>
            You are anonymously evaluating: <strong>{assessedUser.first_name} {assessedUser.last_name}</strong>
            <br />
            Your responses are completely anonymous and will only be shown as aggregated data (minimum 3 responses required).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <PeerAssessmentDomainSection
                form={form}
                domain="L"
                title="Domain 1: Leadership DNA – Trust, Integrity, and Influence"
              />

              <PeerAssessmentDomainSection
                form={form}
                domain="E"
                title="Domain 2: Excellence – Standards, Effort, and Consistency"
              />

              <PeerAssessmentDomainSection
                form={form}
                domain="A"
                title="Domain 3: Accountability – Ownership, Dependability, and Honesty"
              />

              <PeerAssessmentDomainSection
                form={form}
                domain="D"
                title="Domain 4: Discipline – Focus, Self-Control, and Commitment"
              />

              <PeerAssessmentDomainSection
                form={form}
                domain="B"
                title="Domain 5: Belonging & Impact – Culture, Empathy, and Service"
              />

              <div className="space-y-2">
                <Label htmlFor="optional_comment">
                  Optional Anonymous Comment (2-3 sentences about team impact or leadership moment)
                </Label>
                <Textarea
                  id="optional_comment"
                  placeholder="Your comment will be anonymous..."
                  {...form.register("optional_comment")}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Anonymous Assessment
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
