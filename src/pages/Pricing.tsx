import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Loader2 } from "lucide-react";
import { PaymentOptionModal } from "@/components/payments/PaymentOptionModal";
import { CoachesContactModal } from "@/components/payments/CoachesContactModal";
import { useToast } from "@/hooks/use-toast";

interface Package {
  id: string;
  name: string;
  slug: string;
  base_price_cents: number;
  description: string;
  features: string[];
  has_payment_plan: boolean;
  payment_plan_config?: {
    down_payment_cents?: number;
    installments: { amount_cents: number; due_days: number }[];
  };
  includes_summer_program: boolean;
  display_order: number;
}

export default function Pricing() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCoachesModal, setShowCoachesModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return (data || []).map(pkg => ({
        ...pkg,
        features: pkg.features as unknown as string[],
        payment_plan_config: pkg.payment_plan_config as any
      })) as Package[];
    },
  });

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const handlePackageClick = async (pkg: Package) => {
    if (pkg.slug === "coaches") {
      setShowCoachesModal(true);
    } else if (pkg.has_payment_plan) {
      setSelectedPackage(pkg);
      setShowPaymentModal(true);
    } else {
      // Direct checkout for non-payment-plan packages
      setCheckoutLoading(pkg.id);
      
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            package_id: pkg.id,
            payment_type: "full",
          },
        });

        if (error) throw error;

        if (data?.url) {
          // Redirect to Stripe Checkout in new tab
          window.open(data.url, '_blank');
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (error: any) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCheckoutLoading(null);
      }
    }
  };

  const getBadge = (slug: string) => {
    if (slug === "elevation") return <Badge className="bg-primary">Most Popular</Badge>;
    if (slug === "transformation") return <Badge className="bg-accent">Best Value</Badge>;
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Leadership Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Transform your leadership potential with our comprehensive programs
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">100% Money-Back Guarantee - 14 Days</span>
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {packages?.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative hover:shadow-xl transition-all duration-300 ${
                pkg.slug === "elevation" ? "border-primary border-2 scale-105" : ""
              } ${pkg.slug === "coaches" ? "lg:col-span-3 md:col-span-2" : ""}`}
            >
              {getBadge(pkg.slug) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {getBadge(pkg.slug)}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription className="text-base">{pkg.description}</CardDescription>
                <div className="pt-4">
                  {pkg.slug === "coaches" ? (
                    <p className="text-3xl font-bold">Custom Pricing</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold">{formatPrice(pkg.base_price_cents)}</p>
                      {pkg.has_payment_plan && (
                        <Badge variant="outline" className="mt-2">
                          Payment Plans Available
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handlePackageClick(pkg)}
                  variant={pkg.slug === "coaches" ? "outline" : "default"}
                  disabled={checkoutLoading === pkg.id}
                >
                  {checkoutLoading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      {pkg.slug === "coaches"
                        ? "Contact Us"
                        : pkg.has_payment_plan
                        ? "Choose Payment Option"
                        : `Get Started - ${formatPrice(pkg.base_price_cents)}`}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          <p className="mb-2">Secure checkout powered by Stripe</p>
          <p>All packages include permanent access to workshop replays</p>
        </div>
      </div>

      {/* Modals */}
      {selectedPackage && (
        <PaymentOptionModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          package={selectedPackage}
        />
      )}
      
      <CoachesContactModal
        open={showCoachesModal}
        onOpenChange={setShowCoachesModal}
      />
    </div>
  );
}
