import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useUserOrganization } from '@/hooks/useUserOrganization';

interface JoinRequest {
  id: string;
  user_id: string;
  requested_role: string;
  message: string | null;
  status: string;
  created_at: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
}

export const JoinRequestsManager = () => {
  const { primaryOrg } = useUserOrganization();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (primaryOrg) {
      loadData();
    }
  }, [primaryOrg]);

  const loadData = async () => {
    if (!primaryOrg) return;

    setLoading(true);
    
    // Load join requests
    const { data: requestsData, error: requestsError } = await supabase
      .from('organization_join_requests')
      .select('*')
      .eq('organization_id', primaryOrg.organization_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error loading join requests:', requestsError);
      toast.error('Failed to load join requests');
    } else if (requestsData) {
      // Fetch profiles for each request
      const userIds = requestsData.map(r => r.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const enrichedRequests = requestsData.map(req => {
        const profile = profilesMap.get(req.user_id);
        return {
          ...req,
          user_first_name: profile?.first_name || '',
          user_last_name: profile?.last_name || '',
          user_email: profile?.email || '',
        };
      });

      setRequests(enrichedRequests);
    }

    // Load teams
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, sport')
      .eq('organization_id', primaryOrg.organization_id)
      .order('name');

    if (teamsError) {
      console.error('Error loading teams:', teamsError);
    } else {
      setTeams(teamsData || []);
    }

    setLoading(false);
  };

  const handleProcessRequest = async (requestId: string, approve: boolean) => {
    setProcessing(requestId);

    try {
      const { data, error } = await supabase.rpc('process_join_request', {
        request_id: requestId,
        approve,
        assign_team_id: approve ? (selectedTeams[requestId] && selectedTeams[requestId] !== 'none' ? selectedTeams[requestId] : null) : null,
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };
      if (result?.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result?.message || 'Failed to process request');
      }
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  if (!primaryOrg) {
    return <div>Please select an organization</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join Requests
        </CardTitle>
        <CardDescription>
          Review and approve requests to join your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground p-8">No pending join requests</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Assign Team</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.user_first_name} {request.user_last_name}
                  </TableCell>
                  <TableCell>{request.user_email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {request.requested_role}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.message || '-'}
                  </TableCell>
                  <TableCell>
                    {(request.requested_role === 'student' || request.requested_role === 'coach') && teams.length > 0 ? (
                      <Select
                        value={selectedTeams[request.id] || ''}
                        onValueChange={(value) => 
                          setSelectedTeams(prev => ({ ...prev, [request.id]: value }))
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No team</SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleProcessRequest(request.id, true)}
                        disabled={processing === request.id}
                      >
                        {processing === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleProcessRequest(request.id, false)}
                        disabled={processing === request.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
