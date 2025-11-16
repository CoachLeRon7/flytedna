import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const coachInquirySchema = z.object({
  coach_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  coach_email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  phone_number: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  organization_name: z.string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must be less than 200 characters"),
  sport: z.string()
    .trim()
    .min(2, "Sport must be at least 2 characters")
    .max(50, "Sport must be less than 50 characters"),
  team_size: z.string()
    .min(1, "Please select a team size"),
  program_type: z.string()
    .min(1, "Please select a program type"),
  message: z.string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

type CoachInquiryFormData = z.infer<typeof coachInquirySchema>;

interface CoachesContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachesContactModal({ open, onOpenChange }: CoachesContactModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<CoachInquiryFormData>({
    resolver: zodResolver(coachInquirySchema),
    defaultValues: {
      coach_name: "",
      coach_email: "",
      phone_number: "",
      organization_name: "",
      sport: "",
      team_size: "",
      program_type: "",
      message: "",
    },
  });

  const onSubmit = async (data: CoachInquiryFormData) => {
    try {
      const { error } = await supabase.from("coaches_inquiries").insert({
        coach_name: data.coach_name,
        coach_email: data.coach_email,
        phone_number: data.phone_number || null,
        organization_name: data.organization_name,
        sport: data.sport,
        team_size: parseInt(data.team_size),
        program_type: data.program_type,
        message: data.message || null,
        estimated_value_cents: estimateValue(parseInt(data.team_size)),
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Inquiry submitted successfully!");
      
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
        form.reset();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit inquiry. Please try again.");
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coach_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coach_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="coach@school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School/Organization Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Lincoln High School" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport *</FormLabel>
                    <FormControl>
                      <Input placeholder="Basketball" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="12">10-15 athletes</SelectItem>
                        <SelectItem value="18">16-20 athletes</SelectItem>
                        <SelectItem value="23">21-25 athletes</SelectItem>
                        <SelectItem value="30">25+ athletes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="program_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Club">Club</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="Youth">Youth</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Tell us about your team's needs and goals..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
