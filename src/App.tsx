import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const OurStory = lazy(() => import("./pages/OurStory"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Results = lazy(() => import("./pages/Results"));
const GrowthPlan = lazy(() => import("./pages/GrowthPlan"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const CoachAssessment = lazy(() => import("./pages/CoachAssessment"));
const CoachAssessmentConfirmation = lazy(() => import("./pages/CoachAssessmentConfirmation"));
const PeerAssessment = lazy(() => import("./pages/PeerAssessment"));
const GuardianAssessment = lazy(() => import("./pages/GuardianAssessment"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PurchasesDashboard = lazy(() => import("./pages/PurchasesDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/results" element={<Results />} />
                <Route path="/growth-plan" element={<GrowthPlan />} />
                <Route path="/coach" element={<CoachDashboard />} />
                <Route path="/coach/assess" element={<CoachAssessment />} />
                <Route path="/coach-assessment-confirmation" element={<CoachAssessmentConfirmation />} />
                <Route path="/peer/assess" element={<PeerAssessment />} />
                <Route path="/guardian/assess" element={<GuardianAssessment />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/dashboard/purchases" element={<PurchasesDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;