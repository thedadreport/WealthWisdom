import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import WelcomeSection from "@/components/dashboard/welcome-section";
import CashFlowCards from "@/components/dashboard/cash-flow-cards";
import BudgetFramework from "@/components/dashboard/budget-framework";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import PsychologyInsights from "@/components/dashboard/psychology-insights";
import FinancialGoals from "@/components/dashboard/financial-goals";
import AutomationStatus from "@/components/dashboard/automation-status";
import PayPeriodTimeline from "@/components/dashboard/pay-period-timeline";
import TransactionForm from "@/components/forms/transaction-form";
import GoalForm from "@/components/forms/goal-form";
import type { User, Budget, Transaction, Goal, Automation } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  
  // For demo purposes, we'll use userId = 1
  const userId = 1;
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: budget } = useQuery<Budget>({
    queryKey: [`/api/budgets/user/${userId}`],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/user/${userId}`],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/goals/user/${userId}`],
  });

  const { data: automations = [] } = useQuery<Automation[]>({
    queryKey: [`/api/automations/user/${userId}`],
  });

  // If user is not found, show onboarding
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-sm border border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Welcome to FlowBudget!</h2>
        <p className="text-neutral-600 mb-6">
          Let's get you started with setting up your personalized budget and pay schedule.
        </p>
        <Button className="w-full" onClick={() => window.location.href = '/onboarding'}>
          Get Started
        </Button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <WelcomeSection user={user} />
      
      <CashFlowCards 
        user={user} 
        budget={budget} 
        transactions={transactions} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <BudgetFramework 
            user={user} 
            budget={budget} 
            transactions={transactions} 
          />
          
          <RecentTransactions transactions={transactions.slice(0, 5)} />
        </div>
        
        <div className="space-y-6">
          <PsychologyInsights />
          
          <FinancialGoals 
            goals={goals} 
            onAddGoal={() => setIsGoalDialogOpen(true)} 
          />
          
          <AutomationStatus automations={automations} />
        </div>
      </div>
      
      <PayPeriodTimeline user={user} transactions={transactions} />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm 
              userId={userId} 
              onSuccess={() => setIsTransactionDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Financial Goal</DialogTitle>
          </DialogHeader>
          <GoalForm 
            userId={userId} 
            onSuccess={() => setIsGoalDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
