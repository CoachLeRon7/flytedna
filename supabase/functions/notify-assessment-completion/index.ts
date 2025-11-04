import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentCompletedPayload {
  assessment_id: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication (JWT already verified by Supabase gateway)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { assessment_id, user_id }: AssessmentCompletedPayload = await req.json();

    // Verify authorization: the authenticated user must be the assessment owner
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You can only trigger notifications for your own assessments" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Verify the assessment exists and belongs to the user
    const { data: assessmentCheck, error: assessmentCheckError } = await supabase
      .from("assessments")
      .select("user_id")
      .eq("id", assessment_id)
      .single();

    if (assessmentCheckError || !assessmentCheck || assessmentCheck.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Assessment not found or access denied" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Processing assessment completion notification:", { assessment_id, user_id });

    // Get student profile and assessment details
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, team_id")
      .eq("id", user_id)
      .single();

    if (studentError || !student) {
      console.error("Error fetching student:", studentError);
      throw new Error("Student not found");
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("timepoint, semester_label")
      .eq("id", assessment_id)
      .single();

    if (assessmentError || !assessment) {
      console.error("Error fetching assessment:", assessmentError);
      throw new Error("Assessment not found");
    }

    const studentName = `${student.first_name} ${student.last_name}`;
    const resultsUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/results?assessment_id=${assessment_id}`;

    // Notify the student
    await supabase.from("notifications").insert({
      user_id: user_id,
      title: "Assessment Complete!",
      message: `You've completed your ${assessment.timepoint} assessment. View your results now.`,
    });

    // Send email to student
    try {
      await resend.emails.send({
        from: "FLYTE Academy <onboarding@resend.dev>",
        to: [student.email],
        subject: "Your Leadership Assessment is Complete",
        html: `
          <h2>Assessment Completed Successfully</h2>
          <p>Hi ${student.first_name},</p>
          <p>You've successfully completed your ${assessment.timepoint} leadership assessment for ${assessment.semester_label}.</p>
          <p><a href="${resultsUrl}" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Results</a></p>
          <p>Next steps:</p>
          <ul>
            <li>Your teammates can now complete peer assessments for you</li>
            <li>Your coach will complete their assessment soon</li>
            <li>Your final 360° score will be calculated once all assessments are complete</li>
          </ul>
          <p>Best,<br>FLYTE Academy Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending student email:", emailError);
    }

    // Get coaches for the student's team
    if (student.team_id) {
      const { data: team } = await supabase
        .from("teams")
        .select("coach_ids, name")
        .eq("id", student.team_id)
        .single();

      if (team && team.coach_ids && team.coach_ids.length > 0) {
        // Notify each coach
        for (const coachId of team.coach_ids) {
          await supabase.from("notifications").insert({
            user_id: coachId,
            title: "New Assessment Completed",
            message: `${studentName} has completed their ${assessment.timepoint} assessment. Time to complete your coach assessment.`,
          });

          // Get coach email
          const { data: coach } = await supabase
            .from("profiles")
            .select("email, first_name")
            .eq("id", coachId)
            .single();

          if (coach) {
            try {
              await resend.emails.send({
                from: "FLYTE Academy <onboarding@resend.dev>",
                to: [coach.email],
                subject: `${studentName} Completed Their Assessment`,
                html: `
                  <h2>Student Assessment Ready for Review</h2>
                  <p>Hi ${coach.first_name},</p>
                  <p>${studentName} from ${team.name} has completed their ${assessment.timepoint} leadership assessment.</p>
                  <p><a href="${resultsUrl}" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Results & Complete Your Assessment</a></p>
                  <p>Action required:</p>
                  <ul>
                    <li>Review their self-assessment results</li>
                    <li>Complete your coach assessment (15 questions)</li>
                    <li>Your feedback will be weighted at 25% of their final score</li>
                  </ul>
                  <p>Best,<br>FLYTE Academy Team</p>
                `,
              });
            } catch (emailError) {
              console.error(`Error sending coach email to ${coachId}:`, emailError);
            }
          }
        }
      }

      // Notify teammates for peer assessment
      const { data: teammates } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("team_id", student.team_id)
        .neq("id", user_id);

      if (teammates && teammates.length > 0) {
        for (const teammate of teammates) {
          await supabase.from("notifications").insert({
            user_id: teammate.id,
            title: "Peer Assessment Available",
            message: `${studentName} has completed their assessment. Complete a peer assessment to help them grow.`,
          });

          // Send email to teammate
          try {
            await resend.emails.send({
              from: "FLYTE Academy <onboarding@resend.dev>",
              to: [teammate.email],
              subject: "Peer Assessment Request",
              html: `
                <h2>Your Teammate Needs Your Feedback</h2>
                <p>Hi ${teammate.first_name},</p>
                <p>${studentName} has completed their ${assessment.timepoint} leadership assessment and is ready for peer feedback.</p>
                <p><a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/peer-assessment" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Peer Assessment</a></p>
                <p>Why your feedback matters:</p>
                <ul>
                  <li>Peer assessments provide valuable external perspective</li>
                  <li>Your input counts for 15% of their final score</li>
                  <li>Takes only 5-7 minutes to complete</li>
                </ul>
                <p>Best,<br>FLYTE Academy Team</p>
              `,
            });
          } catch (emailError) {
            console.error(`Error sending teammate email to ${teammate.id}:`, emailError);
          }
        }
      }
    }

    // Notify all admins
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id, profiles(email, first_name)")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabase.from("notifications").insert({
          user_id: admin.user_id,
          title: "Assessment Submitted",
          message: `${studentName} completed their ${assessment.timepoint} assessment for ${assessment.semester_label}.`,
        });

        const adminProfile = admin.profiles as any;
        if (adminProfile && adminProfile.email) {
          try {
            await resend.emails.send({
              from: "FLYTE Academy <onboarding@resend.dev>",
              to: [adminProfile.email],
              subject: "New Assessment Submitted",
              html: `
                <h2>Assessment Activity Report</h2>
                <p>Hi ${adminProfile.first_name},</p>
                <p>${studentName} has submitted their ${assessment.timepoint} assessment for ${assessment.semester_label}.</p>
                <p><a href="${resultsUrl}" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Results</a></p>
                <p>Best,<br>FLYTE Academy System</p>
              `,
            });
          } catch (emailError) {
            console.error(`Error sending admin email to ${admin.user_id}:`, emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in notify-assessment-completion:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred sending notifications. Please try again." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
