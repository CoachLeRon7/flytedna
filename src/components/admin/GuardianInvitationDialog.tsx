import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AssessmentTimepoint } from "@/lib/utils";

interface GuardianInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteId: string;
  athleteName: string;
  timepoint: AssessmentTimepoint;
  semesterLabel: string;
}

export const GuardianInvitationDialog = ({
  open,
  onOpenChange,
  athleteId,
  athleteName,
  timepoint,
  semesterLabel,
}: GuardianInvitationDialogProps) => {
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationship, setRelationship] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSendInvitation = async () => {
    if (!guardianName || !guardianEmail || !relationship) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-guardian-invitation', {
        body: {
          athleteId,
          guardianEmail,
          guardianName,
          guardianRelationship: relationship,
          timepoint,
          semesterLabel,
        },
      });

      if (error) throw error;

      toast.success(`Guardian invitation sent to ${guardianEmail}`);
      setGuardianName("");
      setGuardianEmail("");
      setRelationship("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending guardian invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Guardian to Assess {athleteName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="guardian-name">Guardian Name</Label>
            <Input
              id="guardian-name"
              placeholder="e.g., John Smith"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian-email">Guardian Email</Label>
            <Input
              id="guardian-email"
              type="email"
              placeholder="guardian@example.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship to Athlete</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="guardian">Legal Guardian</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Guardian receives an email invitation</li>
              <li>They complete a 15-question assessment (10 min)</li>
              <li>Results automatically count toward 360° score (20% weight)</li>
              <li>Invitation expires in 30 days</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSendInvitation} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
