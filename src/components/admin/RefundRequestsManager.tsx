import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RefundRequest {
  id: string;
  purchase_id: string;
  user_id: string;
  reason: string;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  stripe_refund_id: string | null;
  purchases: {
    total_amount_cents: number;
    packages: {
      name: string;
    };
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const RefundRequestsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRefundRequests();
  }, []);

  const loadRefundRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("refund_requests")
        .select(`
          *,
          purchases (
            total_amount_cents,
            packages (
              name
            )
          ),
          profiles!refund_requests_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error loading refund requests:", error);
      toast({
        title: "Error loading requests",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReview = (request: RefundRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setReviewDialogOpen(true);
  };

  const processRefundRequest = async (approve: boolean) => {
    if (!selectedRequest) return;

    if (!adminNotes.trim() && !approve) {
      toast({
        title: "Admin notes required",
        description: "Please provide a reason for rejecting this request.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: approve ? "approved" : "rejected",
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes.trim() || null,
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Send email notification in background
      supabase.functions
        .invoke("send-refund-status-email", {
          body: {
            refundRequestId: selectedRequest.id,
            status: approve ? "approved" : "rejected",
          },
        })
        .then(({ error: emailError }) => {
          if (emailError) {
            console.error("Error sending email notification:", emailError);
          }
        });

      toast({
        title: approve ? "Request approved" : "Request rejected",
        description: `Refund request has been ${approve ? "approved" : "rejected"}. An email notification has been sent to the user.`,
      });

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes("");
      loadRefundRequests();
    } catch (error: any) {
      console.error("Error processing refund request:", error);
      toast({
        title: "Error processing request",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
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
                <RefreshCw className="h-5 w-5 text-primary" />
                Refund Requests
              </CardTitle>
              <CardDescription>
                Review and manage customer refund requests
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingCount} pending
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadRefundRequests}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No refund requests found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {request.profiles.first_name} {request.profiles.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.profiles.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {request.purchases.packages.name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatCurrency(request.purchases.total_amount_cents)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate text-sm">
                          {request.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {formatDistanceToNow(new Date(request.requested_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(request)}
                          >
                            Review
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReview(request)}
                          >
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.status === "pending"
                  ? "Review Refund Request"
                  : "Refund Request Details"}
              </DialogTitle>
              <DialogDescription>
                Request from {selectedRequest.profiles.first_name}{" "}
                {selectedRequest.profiles.last_name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Package</Label>
                  <p className="font-medium">
                    {selectedRequest.purchases.packages.name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedRequest.purchases.total_amount_cents)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested</Label>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(selectedRequest.requested_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">User Email</Label>
                <p className="font-medium">{selectedRequest.profiles.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Customer Reason</Label>
                <div className="mt-1 p-3 rounded-lg bg-muted">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedRequest.reason}
                  </p>
                </div>
              </div>

              {selectedRequest.status !== "pending" && selectedRequest.admin_notes && (
                <div>
                  <Label className="text-muted-foreground">Admin Notes</Label>
                  <div className="mt-1 p-3 rounded-lg bg-muted">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedRequest.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <>
                  <div className="flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3">
                    <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Note: Approving this request will update the status. You'll need to
                      process the actual Stripe refund separately through the Stripe
                      dashboard or webhook.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-notes">
                      Admin Notes {!adminNotes.trim() && "(Optional for approval, required for rejection)"}
                    </Label>
                    <Textarea
                      id="admin-notes"
                      placeholder="Add notes about this decision..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              {selectedRequest.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setReviewDialogOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => processRefundRequest(false)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => processRefundRequest(true)}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setReviewDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
