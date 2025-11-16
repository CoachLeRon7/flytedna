import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Calendar, FileText, Shield } from "lucide-react";
import { format } from "date-fns";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchase", sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error("No session ID");
      
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          packages (*),
          payment_plan_installments (*)
        `)
        .eq("stripe_checkout_session_id", sessionId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

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
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Purchase not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pkg = purchase.packages as any;
  const installments = (purchase.payment_plan_installments || []) as any[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to {pkg.name}
          </p>
        </div>

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
        {purchase.purchase_type === "payment_plan" && installments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {installments.map((inst: any, idx: number) => (
                  <div key={inst.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Payment {inst.installment_number}
                        {inst.status === "paid" && " ✓"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inst.status === "paid" 
                          ? `Paid on ${format(new Date(inst.paid_at), "MMM d, yyyy")}`
                          : `Due ${format(new Date(inst.due_date), "MMM d, yyyy")}`
                        }
                      </p>
                    </div>
                    <Badge variant={inst.status === "paid" ? "default" : "outline"}>
                      {formatPrice(inst.amount_cents)}
                    </Badge>
                  </div>
                ))}
              </div>
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
              <div>
                <p className="font-semibold">Access Workshop Replays</p>
                <p className="text-sm text-muted-foreground">
                  Your lifetime access to all workshop content is now active
                </p>
                <Button variant="link" className="px-0 h-auto" asChild>
                  <Link to="/dashboard">View Workshops</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Download Starter Materials</p>
                <p className="text-sm text-muted-foreground">
                  Get your leadership workbook and assessment tools
                </p>
                <Button variant="link" className="px-0 h-auto">
                  Download Resources
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
