import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Calendar, FileText, Shield, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [retryCount, setRetryCount] = useState(0);

  const { data: purchase, isLoading, refetch } = useQuery({
    queryKey: ["purchase", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          packages (*),
          payment_plan_installments (*),
          package_access (*)
        `)
        .eq("stripe_checkout_session_id", sessionId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      // If purchase is still pending and we haven't retried too many times, keep polling
      const data = query.state.data;
      if (data && data.status === "pending" && retryCount < 10) {
        return 3000; // Poll every 3 seconds
      }
      return false; // Stop polling
    },
  });

  // Track retry attempts
  useEffect(() => {
    if (purchase?.status === "pending") {
      setRetryCount(prev => prev + 1);
    }
  }, [purchase?.status]);

  const handleManualRefresh = async () => {
    toast.info("Checking payment status...");
    await refetch();
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Purchase Not Found</CardTitle>
            <CardDescription>
              We couldn't locate your purchase. This might happen if the payment is still processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your payment was received, but it may take a few moments for our system to process it.
            </p>
            <Button onClick={handleManualRefresh} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Status
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              If the issue persists, please contact support@flyteacademy.com
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pkg = purchase.packages as any;
  const installments = (purchase.payment_plan_installments || []) as any[];
  const packageAccess = (purchase.package_access || []) as any[];
  const hasActiveAccess = packageAccess.some((access: any) => access.is_active);
  const isFullyPaid = purchase.status === "completed";
  const isPending = purchase.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Processing Notice */}
        {isPending && (
          <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Payment Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Your payment was received and is being processed. This usually takes just a few seconds.
                    </p>
                  </div>
                </div>
                <Button onClick={handleManualRefresh} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {isFullyPaid ? "Payment Successful!" : "Payment Received!"}
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to {pkg.name}
          </p>
          {!isFullyPaid && (
            <Badge variant="outline" className="mt-2">
              {isPending ? "Processing" : "Payment Plan Active"}
            </Badge>
          )}
        </div>

        {/* Confirmation Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm text-center">
              📧 A confirmation email has been sent to your inbox with your receipt and access details.
            </p>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Order placed on {format(new Date(purchase.purchased_at), "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{pkg.name}</p>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </div>
              <p className="font-bold text-lg">{formatPrice(pkg.base_price_cents)}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Amount Paid Today:</span>
                <span className="font-semibold">{formatPrice(purchase.amount_paid_cents)}</span>
              </div>
              
              {purchase.purchase_type === "payment_plan" && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Remaining Balance:</span>
                  <span>{formatPrice(purchase.total_amount_cents - purchase.amount_paid_cents)}</span>
                </div>
              )}
            </div>

            {/* Membership Info */}
            <div className="border-t pt-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">Membership Active</p>
                <p className="text-sm text-muted-foreground">
                  Valid through {format(new Date(purchase.membership_end_date), "MMMM d, yyyy")}
                </p>
              </div>
              <Badge variant="secondary">14-Day Guarantee</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Plan Schedule */}
        {!isFullyPaid && installments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>
                Your remaining installments will be automatically charged
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {installments
                  .filter((inst: any) => inst.status !== "paid")
                  .map((inst: any) => (
                    <div key={inst.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Payment {inst.installment_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Due on {format(new Date(inst.due_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(inst.amount_cents)}</p>
                        <Badge variant="outline" className="mt-1">
                          {inst.status === "pending" ? "Scheduled" : inst.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Payment method on file will be charged automatically. You'll receive email reminders before each payment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">1. Access Your Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  View your leadership assessment results, growth plans, and workshop replays
                </p>
                <Button variant="link" className="px-0 h-auto" asChild>
                  <Link to="/dashboard">Go to Dashboard →</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">2. Download Your Materials</p>
                <p className="text-sm text-muted-foreground">
                  Get your leadership workbook, assessment tools, and exclusive resources
                </p>
                <Button variant="link" className="px-0 h-auto">
                  Download Resources →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">3. Complete Your First Assessment</p>
                <p className="text-sm text-muted-foreground">
                  Start your leadership journey by taking your initial self-assessment
                </p>
                <Button variant="link" className="px-0 h-auto" asChild>
                  <Link to="/assessment">Take Assessment →</Link>
                </Button>
              </div>
            </div>

            {pkg.includes_summer_program && (purchase.metadata as any)?.enrollInSummer && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Complete Summer Program Enrollment</p>
                  <p className="text-sm text-muted-foreground">
                    Fill out your athlete's educational profile to complete enrollment
                  </p>
                  <Button variant="link" className="px-0 h-auto" asChild>
                    <Link to={`/summer-program/enroll?purchase=${purchase.id}`}>
                      Complete Enrollment
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex gap-4">
          <Button asChild className="flex-1" size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="lg">
            <Link to="/results">View My Results</Link>
          </Button>
        </div>

        {/* Support */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Questions? Contact us at support@flyteacademy.com
        </p>
      </div>
    </div>
  );
}
