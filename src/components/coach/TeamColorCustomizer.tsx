import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Palette, Save } from "lucide-react";
import { z } from "zod";

const colorSchema = z.object({
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format"),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format"),
  institution: z.string().max(255, "Institution name too long").optional(),
});

interface Team {
  id: string;
  name: string;
  sport: string;
  institution: string | null;
  primary_color: string;
  secondary_color: string;
}

export const TeamColorCustomizer = ({ teamId }: { teamId: string }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#1E40AF");
  const [secondaryColor, setSecondaryColor] = useState("#3B82F6");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (error) {
      toast({
        title: "Error loading team",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTeam(data);
    setPrimaryColor(data.primary_color || "#1E40AF");
    setSecondaryColor(data.secondary_color || "#3B82F6");
    setInstitution(data.institution || "");
  };

  const handleSave = async () => {
    setLoading(true);

    // Validate colors
    try {
      colorSchema.parse({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        institution: institution || undefined,
      });
    } catch (error) {
      toast({
        title: "Invalid input",
        description: error instanceof Error ? error.message : "Invalid color format",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("teams")
      .update({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        institution: institution || null,
      })
      .eq("id", teamId);

    if (error) {
      toast({
        title: "Error saving colors",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Team colors updated!",
      description: "Your team's custom colors have been saved",
    });

    setLoading(false);
    fetchTeam();
  };

  if (!team) return null;

  return (
    <Card className="border-2 border-[hsl(var(--coach-accent))]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Team Branding
        </CardTitle>
        <CardDescription>
          Customize your team colors to match your institution's branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Institution Name</Label>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g., University of Michigan"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#1E40AF"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border-2" style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
        }}>
          <div className="text-white text-center">
            <p className="font-bold text-xl">{team.name}</p>
            <p className="text-sm opacity-90">{team.sport}</p>
            {institution && <p className="text-sm opacity-75 mt-1">{institution}</p>}
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-[hsl(var(--coach-accent))] hover:bg-[hsl(var(--coach-accent))]/90"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Team Branding
        </Button>
      </CardContent>
    </Card>
  );
};
