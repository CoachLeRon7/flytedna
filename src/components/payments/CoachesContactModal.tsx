import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface CoachesContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachesContactModal({ open, onOpenChange }: CoachesContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    coach_name: "",
    coach_email: "",
    phone_number: "",
    organization_name: "",
    sport: "",
    team_size: "",
    program_type: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("coaches_inquiries").insert({
        ...formData,
        team_size: parseInt(formData.team_size),
        estimated_value_cents: estimateValue(parseInt(formData.team_size)),
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Inquiry submitted successfully!");
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        setFormData({
          coach_name: "",
          coach_email: "",
          phone_number: "",
          organization_name: "",
          sport: "",
          team_size: "",
          program_type: "",
          message: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimateValue = (teamSize: number): number => {
    // Estimate based on $100-150 per athlete
    return teamSize * 12500; // $125 average
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              We've received your inquiry and will contact you within 24 hours with a custom quote for your team.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Coaches & Program Inquiry</DialogTitle>
          <DialogDescription>
            Tell us about your team and we'll create a custom solution for you
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coach_name">Coach Name *</Label>
              <Input
                id="coach_name"
                required
                value={formData.coach_name}
                onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach_email">Email *</Label>
              <Input
                id="coach_email"
                type="email"
                required
                value={formData.coach_email}
                onChange={(e) => setFormData({ ...formData, coach_email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_name">School/Organization Name *</Label>
            <Input
              id="organization_name"
              required
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Input
                id="sport"
                required
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_size">Team Size *</Label>
              <Select value={formData.team_size} onValueChange={(v) => setFormData({ ...formData, team_size: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">10-15 athletes</SelectItem>
                  <SelectItem value="18">16-20 athletes</SelectItem>
                  <SelectItem value="23">21-25 athletes</SelectItem>
                  <SelectItem value="30">25+ athletes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="program_type">Program Type *</Label>
            <Select value={formData.program_type} onValueChange={(v) => setFormData({ ...formData, program_type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Club">Club</SelectItem>
                <SelectItem value="College">College</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Tell us about your team's needs and goals..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
