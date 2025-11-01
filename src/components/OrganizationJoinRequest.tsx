import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  institution: string | null;
}

interface ExistingRequest {
  id: string;
  organization_id: string;
  requested_role: string;
  status: string;
  organizations: Organization;
}

export const OrganizationJoinRequest = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [existingRequests, setExistingRequests] = useState<ExistingRequest[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [requestedRole, setRequestedRole] = useState<'student' | 'coach' | 'org_admin'>('student');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Load all organizations
    const { data: orgsData, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, institution')
      .order('name');

    if (orgsError) {
      console.error('Error loading organizations:', orgsError);
    } else {
      setOrganizations(orgsData || []);
    }

    // Load user's existing requests
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: requestsData, error: requestsError } = await supabase
        .from('organization_join_requests')
        .select('*, organizations(id, name, institution)')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved']);

      if (requestsError) {
        console.error('Error loading join requests:', requestsError);
      } else {
        setExistingRequests(requestsData || []);
      }
    }

    setLoading(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('organization_join_requests')
        .insert({
          user_id: user.id,
          organization_id: selectedOrg,
          requested_role: requestedRole,
          message: message || null,
        });

      if (error) throw error;

      toast.success('Join request submitted! An administrator will review your request.');
      setSelectedOrg('');
      setMessage('');
      loadData();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter out organizations the user has already requested to join
  const availableOrgs = organizations.filter(
    org => !existingRequests.some(req => req.organization_id === org.id)
  );

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="default">Approved</Badge>;
    if (status === 'pending') return <Badge variant="secondary">Pending</Badge>;
    return <Badge variant="destructive">Rejected</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {existingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>Track your organization join requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{request.organizations.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {request.requested_role}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {availableOrgs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Request to Join Organization
            </CardTitle>
            <CardDescription>
              Submit a request to join an organization. An administrator will review your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrgs.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} {org.institution && `- ${org.institution}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Requested Role</Label>
                <Select value={requestedRole} onValueChange={(value: any) => setRequestedRole(value)}>
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

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the administrator why you want to join..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={submitting || !selectedOrg}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {availableOrgs.length === 0 && existingRequests.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No organizations available to join at this time.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
