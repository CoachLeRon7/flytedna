import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Package, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCcw
} from "lucide-react";
import { formatTimepointDisplay } from "@/lib/utils";
import logo from "@/assets/flyte-academy-logo.png";
import { RefundRequestDialog } from "@/components/payments/RefundRequestDialog";

interface Purchase {
  id: string;
  package_id: string;
  total_amount_cents: number;
  amount_paid_cents: number;
  purchase_type: string;
  status: string;
  purchased_at: string;
  membership_start_date: string;
  membership_end_date: string;
  stripe_payment_intent_id: string;
  refund_eligible_until: string | null;
  packages: {
    name: string;
    description: string;
  };
}

interface RefundRequest {
  id: string;
  purchase_id: string;
  status: string;
  reason: string;
  requested_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}

interface PackageAccess {
  id: string;
  package_id: string;
  access_granted_at: string;
  access_expires_at: string;
  is_active: boolean;
  packages: {
    name: string;
    description: string;
  };
}

interface Installment {
  id: string;
  installment_number: number;
  amount_cents: number;
  due_date: string;
  paid_at: string | null;
  status: string;
  purchase_id: string;
}

const PurchasesDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [packageAccess, setPackageAccess] = useState<PackageAccess[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    loadPurchaseData();
  }, []);

  const loadPurchaseData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch purchases with package details
      const { data: purchasesData, error: purchasesError } = await supabase
        .from("purchases")
        .select(`
          *,
          packages (
            name,
            description
          )
        `)
        .eq("user_id", session.user.id)
        .order("purchased_at", { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch active package access
      const { data: accessData, error: accessError } = await supabase
        .from("package_access")
        .select(`
          *,
          packages (
            name,
            description
          )
        `)
        .eq("user_id", session.user.id)
        .eq("is_active", true);

      if (accessError) throw accessError;

      // Fetch upcoming installments
      const { data: installmentsData, error: installmentsError } = await supabase
        .from("payment_plan_installments")
        .select("*")
        .in("purchase_id", purchasesData?.map(p => p.id) || [])
        .order("due_date", { ascending: true });

      if (installmentsError) throw installmentsError;

      // Fetch refund requests
      const { data: refundRequestsData, error: refundRequestsError } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("user_id", session.user.id)
        .order("requested_at", { ascending: false });

      if (refundRequestsError) throw refundRequestsError;

      setPurchases(purchasesData || []);
      setPackageAccess(accessData || []);
      setInstallments(installmentsData || []);
      setRefundRequests(refundRequestsData || []);
    } catch (error: any) {
      console.error("Error loading purchase data:", error);
      toast({
        title: "Error loading purchases",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      completed: { variant: "default", icon: CheckCircle2 },
      pending: { variant: "secondary", icon: Clock },
      paid: { variant: "default", icon: CheckCircle2 },
      failed: { variant: "destructive", icon: AlertCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDownloadReceipt = async (purchaseId: string, paymentIntentId: string) => {
    toast({
      title: "Receipt Download",
      description: "Receipt download functionality coming soon!",
    });
    // TODO: Implement receipt generation/download
  };

  const isRefundEligible = (purchase: Purchase) => {
    if (!purchase.refund_eligible_until) return false;
    return new Date(purchase.refund_eligible_until) > new Date();
  };

  const getPurchaseRefundRequest = (purchaseId: string) => {
    return refundRequests.find(req => req.purchase_id === purchaseId);
  };

  const handleRefundRequest = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setRefundDialogOpen(true);
  };

  const getRefundStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Flyte Academy" className="h-8" />
            <h1 className="text-xl font-semibold">Purchases & Billing</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Active Package Access */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Active Package Access
          </h2>
          {packageAccess.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active package access</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/pricing")}
                >
                  Browse Packages
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {packageAccess.map((access) => (
                <Card key={access.id} className="border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{access.packages.name}</CardTitle>
                        <CardDescription>{access.packages.description}</CardDescription>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Access Granted:</span>
                      <span className="font-medium">{formatDate(access.access_granted_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">{formatDate(access.access_expires_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Installments */}
        {installments.filter(i => !i.paid_at).length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Upcoming Payments
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {installments
                    .filter(i => !i.paid_at)
                    .map((installment) => (
                      <div key={installment.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Installment #{installment.installment_number}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due {formatDate(installment.due_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(installment.amount_cents)}
                          </p>
                          {getStatusBadge(installment.status)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Purchase History */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Purchase History
          </h2>
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No purchases yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => {
                const purchaseInstallments = installments.filter(
                  i => i.purchase_id === purchase.id
                );
                const paidInstallments = purchaseInstallments.filter(i => i.paid_at);

                return (
                  <Card key={purchase.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{purchase.packages.name}</CardTitle>
                          <CardDescription>
                            Purchased on {formatDate(purchase.purchased_at)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(purchase.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(purchase.total_amount_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount Paid</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(purchase.amount_paid_cents)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Type</p>
                          <p className="font-medium capitalize">{purchase.purchase_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Membership Period</p>
                          <p className="text-sm font-medium">
                            {formatDate(purchase.membership_start_date)} - {formatDate(purchase.membership_end_date)}
                          </p>
                        </div>
                      </div>

                      {purchaseInstallments.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium mb-2">Payment Plan</h4>
                            <div className="space-y-2">
                              {purchaseInstallments.map((inst) => (
                                <div
                                  key={inst.id}
                                  className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                                >
                                  <span>
                                    Installment #{inst.installment_number} - Due {formatDate(inst.due_date)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {formatCurrency(inst.amount_cents)}
                                    </span>
                                    {getStatusBadge(inst.status)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {(() => {
                        const refundRequest = getPurchaseRefundRequest(purchase.id);
                        const isEligible = isRefundEligible(purchase);

                        return (
                          <>
                            {refundRequest && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Refund Status</span>
                                    {getRefundStatusBadge(refundRequest.status)}
                                  </div>
                                  {refundRequest.admin_notes && (
                                    <div className="rounded-lg bg-muted p-3">
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Admin Notes:</strong> {refundRequest.admin_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            <div className="flex gap-2">
                              {purchase.stripe_payment_intent_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(purchase.id, purchase.stripe_payment_intent_id)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </Button>
                              )}

                              {isEligible && !refundRequest && purchase.status === "completed" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRefundRequest(purchase)}
                                  className="gap-2"
                                >
                                  <RefreshCcw className="w-4 h-4" />
                                  Request Refund
                                </Button>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedPurchase && (
        <RefundRequestDialog
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          purchaseId={selectedPurchase.id}
          packageName={selectedPurchase.packages.name}
          amount={selectedPurchase.total_amount_cents}
          onSuccess={loadPurchaseData}
        />
      )}
    </div>
  );
};

export default PurchasesDashboard;
