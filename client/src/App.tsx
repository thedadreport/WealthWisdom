import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Budget from "@/pages/budget";
import CashFlow from "@/pages/cash-flow";
import Goals from "@/pages/goals";
import Learn from "@/pages/learn";
import Onboarding from "@/pages/onboarding";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";

function Router() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className={`${isMobile ? 'pb-16' : ''}`}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/budget" component={Budget} />
          <Route path="/cash-flow" component={CashFlow} />
          <Route path="/goals" component={Goals} />
          <Route path="/learn" component={Learn} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
