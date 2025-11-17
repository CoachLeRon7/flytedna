import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, X, Clock, Users, Mail, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

export const PilotInvitationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    max_uses: 1,
    notes: '',
    expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['pilot-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilot_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: pilotUsers } = useQuery({
    queryKey: ['pilot-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          pilot_code_used,
          pilot_started_at,
          package_access!inner(
            access_expires_at,
            is_active
          )
        `)
        .not('pilot_code_used', 'is', null)
        .order('pilot_started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: codeData, error: codeError } = await supabase.rpc('generate_pilot_code');
      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('pilot_invitations')
        .insert({
          invitation_code: codeData,
          created_by: user.id,
          max_uses: newInvitation.max_uses,
          notes: newInvitation.notes,
          expires_at: new Date(newInvitation.expires_at).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation Created",
        description: `Code: ${data.invitation_code}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pilot-invitations'] });
      setIsCreating(false);
      setNewInvitation({
        max_uses: 1,
        notes: '',
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pilot_invitations')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Invitation deactivated" });
      queryClient.invalidateQueries({ queryKey: ['pilot-invitations'] });
    },
  });

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/auth?pilot=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations?.filter(i => i.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pilot Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pilotUsers?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pilot Invitations</CardTitle>
              <CardDescription>
                Generate invitation codes for prospective clients
              </CardDescription>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Pilot Invitation</DialogTitle>
                  <DialogDescription>
                    Create a new pilot code for a prospective client
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-uses">Maximum Uses</Label>
                    <Input
                      id="max-uses"
                      type="number"
                      min="1"
                      value={newInvitation.max_uses}
                      onChange={(e) => setNewInvitation(prev => ({
                        ...prev,
                        max_uses: parseInt(e.target.value) || 1
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expires-at">Expires On</Label>
                    <Input
                      id="expires-at"
                      type="date"
                      value={newInvitation.expires_at}
                      onChange={(e) => setNewInvitation(prev => ({
                        ...prev,
                        expires_at: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Internal)</Label>
                    <Textarea
                      id="notes"
                      placeholder="e.g., 'For John Smith - High School Basketball Coach'"
                      value={newInvitation.notes}
                      onChange={(e) => setNewInvitation(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="w-full"
                  >
                    Generate Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invitations && invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-mono">
                      {invitation.invitation_code}
                    </TableCell>
                    <TableCell>
                      {invitation.current_uses} / {invitation.max_uses}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {invitation.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {invitation.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(invitation.invitation_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {invitation.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateMutation.mutate(invitation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No invitations created yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Pilot Users</CardTitle>
          <CardDescription>
            Users currently on pilot access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Code Used</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pilotUsers && pilotUsers.length > 0 ? (
                pilotUsers.map((user: any) => {
                  const expiresAt = new Date(user.package_access[0]?.access_expires_at);
                  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpired = daysLeft < 0;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.pilot_code_used}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.pilot_started_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(expiresAt, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isExpired ? "destructive" : daysLeft <= 7 ? "default" : "secondary"}>
                          {isExpired ? 'Expired' : `${daysLeft} days`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ExtendPilotDialog userId={user.id} userName={`${user.first_name} ${user.last_name}`} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No pilot users yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ExtendPilotDialog = ({ userId, userName }: { userId: string; userName: string }) => {
  const [days, setDays] = useState(30);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extendMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('extend_pilot_period', {
        _user_id: userId,
        _additional_days: days
      });
      
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Pilot Extended",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['pilot-users'] });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Extend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Pilot Period</DialogTitle>
          <DialogDescription>
            Extend pilot access for {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="extend-days">Additional Days</Label>
            <Input
              id="extend-days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 30)}
            />
          </div>
          <Button 
            onClick={() => extendMutation.mutate()}
            disabled={extendMutation.isPending}
            className="w-full"
          >
            Extend Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
