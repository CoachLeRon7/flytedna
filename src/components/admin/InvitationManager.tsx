import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserOrganization } from '@/hooks/useUserOrganization';

interface Team {
  id: string;
  name: string;
  sport: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
  team_id: string | null;
  teams: { name: string } | null;
}

export const InvitationManager = () => {
  const { primaryOrg } = useUserOrganization();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'coach' | 'org_admin'>('student');
  const [selectedTeam, setSelectedTeam] = useState<string>('none');
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (primaryOrg) {
      loadTeams();
      loadInvitations();
    }
  }, [primaryOrg]);

  const loadTeams = async () => {
    if (!primaryOrg) return;

    const { data, error } = await supabase
      .from('teams')
      .select('id, name, sport')
      .eq('organization_id', primaryOrg.organization_id)
      .order('name');

    if (error) {
      console.error('Error loading teams:', error);
      return;
    }

    setTeams(data || []);
  };

  const loadInvitations = async () => {
    if (!primaryOrg) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('*, teams(name)')
      .eq('organization_id', primaryOrg.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading invitations:', error);
      toast.error('Failed to load invitations');
    } else {
      setInvitations(data || []);
    }
    setLoading(false);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryOrg || !email) return;

    setSending(true);

    try {
      // Get current user for invited_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: primaryOrg.organization_id,
          email: email.toLowerCase(),
          role,
          team_id: selectedTeam && selectedTeam !== 'none' ? selectedTeam : null,
          invited_by: user.id,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Get current user's profile for inviter name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const inviterName = profile ? `${profile.first_name} ${profile.last_name}` : 'Your administrator';

      // Get team name if team was selected
      const teamName = selectedTeam && selectedTeam !== 'none' ? teams.find(t => t.id === selectedTeam)?.name : undefined;

      // Send email
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          organizationName: primaryOrg.organization.name,
          roleName: role === 'org_admin' ? 'Administrator' : role.charAt(0).toUpperCase() + role.slice(1),
          teamName,
          inviterName,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast.error('Invitation created but email failed to send');
      } else {
        toast.success('Invitation sent successfully!');
      }

      // Reset form
      setEmail('');
      setSelectedTeam('none');
      loadInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'accepted') {
      return <Badge variant="default">Accepted</Badge>;
    }
    if (new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (!primaryOrg) {
    return <div>Please select an organization</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Invite coaches and student-athletes to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student-Athlete</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="org_admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(role === 'student' || role === 'coach') && teams.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team assignment</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} - {team.sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" disabled={sending || !email}>
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>Track and manage your organization invitations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-center text-muted-foreground p-8">No invitations sent yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell className="capitalize">{invitation.role}</TableCell>
                    <TableCell>{invitation.teams?.name || '-'}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
                    <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
