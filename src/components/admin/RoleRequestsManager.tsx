import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    sport: string;
  };
}

export function RoleRequestsManager() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadRoleRequests();
  }, []);

  const loadRoleRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch pending requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("pending_role_requests")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (requestsError) throw requestsError;

      // Fetch profiles for these users
      if (requestsData && requestsData.length > 0) {
        const userIds = requestsData.map(r => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, sport")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const combinedData = requestsData.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.id === request.user_id) || {
            first_name: "",
            last_name: "",
            email: "",
            sport: ""
          }
        }));

        setRequests(combinedData);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load role requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const { error } = await supabase.rpc("process_role_request", {
        request_id: requestId,
        approve: true,
      });

      if (error) throw error;

      toast({
        title: "Role Approved",
        description: "The role has been successfully assigned to the user.",
      });

      await loadRoleRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (request: RoleRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(selectedRequest.id);
      const { error } = await supabase.rpc("process_role_request", {
        request_id: selectedRequest.id,
        approve: false,
        rejection_reason: rejectionReason || "No reason provided",
      });

      if (error) throw error;

      toast({
        title: "Role Rejected",
        description: "The role request has been rejected.",
      });

      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      await loadRoleRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "coach":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Requests</CardTitle>
          <CardDescription>Loading pending role requests...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Role Requests
              </CardTitle>
              <CardDescription>
                Review and approve role requests from users
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRoleRequests}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending role requests at this time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.profiles.first_name} {request.profiles.last_name}
                    </TableCell>
                    <TableCell>{request.profiles.email}</TableCell>
                    <TableCell>{request.profiles.sport || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(request.requested_role)}>
                        {request.requested_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(request)}
                        disabled={processing === request.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Role Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this role request? You can optionally provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectConfirm}>
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
