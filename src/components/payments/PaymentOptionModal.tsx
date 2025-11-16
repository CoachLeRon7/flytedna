import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentOptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: {
    id: string;
    name: string;
    slug: string;
    base_price_cents: number;
    payment_plan_config?: {
      down_payment_cents?: number;
      installments: { amount_cents: number; due_days: number }[];
    };
    includes_summer_program: boolean;
  };
}

export function PaymentOptionModal({ open, onOpenChange, package: pkg }: PaymentOptionModalProps) {
  const [paymentType, setPaymentType] = useState<"full_payment" | "payment_plan">("full_payment");
  const [enrollInSummer, setEnrollInSummer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const handleProceed = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          package_id: pkg.id,
          payment_type: paymentType,
          metadata: enrollInSummer ? { summer_enrollment: true } : undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
        onOpenChange(false);
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
      setIsLoading(false);
    }
  };

  const getPaymentPlanBreakdown = () => {
    if (!pkg.payment_plan_config) return null;
    
    const { down_payment_cents, installments } = pkg.payment_plan_config;
    
    if (pkg.slug === "transformation" && down_payment_cents) {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Today:</span>
            <span className="font-semibold">{formatPrice(down_payment_cents)}</span>
          </div>
          {installments.map((inst, idx) => (
            <div key={idx} className="flex justify-between text-muted-foreground">
              <span>Payment {idx + 2} ({inst.due_days} days):</span>
              <span>{formatPrice(inst.amount_cents)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // Academy Lab - 4 equal payments
    return (
      <div className="space-y-2 text-sm">
        {installments.map((inst, idx) => (
          <div key={idx} className="flex justify-between">
            <span>
              {idx === 0 ? "Today:" : `Payment ${idx + 1} (${inst.due_days} days):`}
            </span>
            <span className={idx === 0 ? "font-semibold" : "text-muted-foreground"}>
              {formatPrice(inst.amount_cents)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Payment Option</DialogTitle>
          <DialogDescription>
            Select how you'd like to pay for {pkg.name}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={paymentType} onValueChange={(v) => setPaymentType(v as "full_payment" | "payment_plan")}>
          {/* Full Payment Option */}
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            paymentType === "full_payment" ? "border-primary bg-primary/5" : "border-border"
          }`} onClick={() => setPaymentType("full_payment")}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="full_payment" id="full_payment" />
              <div className="flex-1">
                <Label htmlFor="full_payment" className="text-lg font-semibold cursor-pointer">
                  Pay in Full
                </Label>
                <p className="text-3xl font-bold mt-2">{formatPrice(pkg.base_price_cents)}</p>
                <Badge variant="secondary" className="mt-2">One-time payment</Badge>
              </div>
            </div>
          </div>

          {/* Payment Plan Option */}
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            paymentType === "payment_plan" ? "border-primary bg-primary/5" : "border-border"
          }`} onClick={() => setPaymentType("payment_plan")}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="payment_plan" id="payment_plan" />
              <div className="flex-1">
                <Label htmlFor="payment_plan" className="text-lg font-semibold cursor-pointer flex items-center gap-2">
                  Payment Plan
                  <Calendar className="h-4 w-4" />
                </Label>
                <div className="mt-3">
                  {getPaymentPlanBreakdown()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Total: {formatPrice(pkg.base_price_cents)}
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>

        {/* Summer Program Option */}
        {pkg.includes_summer_program && (
          <div className="border rounded-lg p-4 bg-accent/10">
            <div className="flex items-start gap-3">
              <Checkbox
                id="summer"
                checked={enrollInSummer}
                onCheckedChange={(checked) => setEnrollInSummer(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="summer" className="font-semibold cursor-pointer">
                  Enroll in Summer Leadership Program
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  You'll complete a short enrollment form after purchase to provide your athlete's details
                </p>
              </div>
            </div>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleProceed} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating checkout...
            </>
          ) : (
            <>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
