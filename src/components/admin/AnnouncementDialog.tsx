import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
  targetAudience: z.string(),
  sendEmail: z.boolean(),
});

interface Team {
  id: string;
  name: string;
  sport: string;
}

export const AnnouncementDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    sendEmail: true,
  });

  useEffect(() => {
    if (open) {
      loadTeams();
    }
  }, [open]);

  const loadTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("id, name, sport")
      .order("name");
    
    setTeams(data || []);
  };

  const handleSend = async () => {
    // Validate input
    const validation = announcementSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({
        title: "Invalid input",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-announcement", {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Announcement sent!",
        description: `Delivered to ${data.recipientsCount} recipient${data.recipientsCount !== 1 ? 's' : ''}${data.emailsSent ? ` (${data.emailsSent} emails sent)` : ''}`,
      });

      setFormData({
        title: "",
        message: "",
        targetAudience: "all",
        sendEmail: true,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending announcement:", error);
      toast({
        title: "Error sending announcement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Program Announcement</DialogTitle>
          <DialogDescription>
            Broadcast a message to your selected audience via in-app notifications and email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Announcement Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., End of Season Assessment Reminder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter your announcement message here..."
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              {formData.message.length}/5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience *</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
            >
              <SelectTrigger id="audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone (All Users)</SelectItem>
                <SelectItem value="students">All Student-Athletes</SelectItem>
                <SelectItem value="coaches">All Coaches</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={`team:${team.id}`}>
                    Team: {team.name} ({team.sport})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="sendEmail" className="text-base">
                Send Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Send this announcement via email in addition to in-app notifications
              </p>
            </div>
            <Switch
              id="sendEmail"
              checked={formData.sendEmail}
              onCheckedChange={(checked) => setFormData({ ...formData, sendEmail: checked })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Announcement
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
