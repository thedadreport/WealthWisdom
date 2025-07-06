import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, calculateBudgetAllocations } from "@/lib/finance-utils";
import { RAMIT_FRAMEWORK, TRANSACTION_CATEGORIES } from "@/lib/constants";
import type { User, Budget, Transaction } from "@shared/schema";

export default function BudgetPage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState({
    fixedCostsPercent: "50",
    investmentsPercent: "10",
    savingsPercent: "5",
    guiltFreeSpendingPercent: "35",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const updateBudgetMutation = useMutation({
    mutationFn: async (budgetData: typeof editingBudget) => {
      const data = {
        fixedCostsPercent: parseFloat(budgetData.fixedCostsPercent),
        investmentsPercent: parseFloat(budgetData.investmentsPercent),
        savingsPercent: parseFloat(budgetData.savingsPercent),
        guiltFreeSpendingPercent: parseFloat(budgetData.guiltFreeSpendingPercent),
      };
      
      if (budget) {
        return apiRequest('PATCH', `/api/budgets/${budget.id}`, data);
      } else {
        return apiRequest('POST', '/api/budgets', { ...data, userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/budgets/user/${userId}`] });
      toast({
        title: "Budget updated",
        description: "Your budget percentages have been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-sm border border-neutral-200">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Please complete onboarding</h2>
        <Button onClick={() => window.location.href = '/onboarding'}>
          Go to Onboarding
        </Button>
      </div>
    );
  }

  const income = parseFloat(user.afterTaxIncome);
  
  const defaultBudget = {
    fixedCostsPercent: 50,
    investmentsPercent: 10,
    savingsPercent: 5,
    guiltFreeSpendingPercent: 35,
  };

  const budgetPercentages = budget ? {
    fixedCostsPercent: parseFloat(budget.fixedCostsPercent),
    investmentsPercent: parseFloat(budget.investmentsPercent),
    savingsPercent: parseFloat(budget.savingsPercent),
    guiltFreeSpendingPercent: parseFloat(budget.guiltFreeSpendingPercent),
  } : defaultBudget;

  const allocations = calculateBudgetAllocations(income, budgetPercentages);

  // Calculate actual spending from transactions
  const actualSpending = transactions.reduce((acc, transaction) => {
    const amount = parseFloat(transaction.amount);
    if (transaction.category === 'fixed-costs') acc.fixedCosts += Math.abs(amount);
    if (transaction.category === 'investments') acc.investments += Math.abs(amount);
    if (transaction.category === 'savings') acc.savings += Math.abs(amount);
    if (transaction.category === 'guilt-free-spending') acc.guiltFreeSpending += Math.abs(amount);
    return acc;
  }, {
    fixedCosts: 0,
    investments: 0,
    savings: 0,
    guiltFreeSpending: 0,
  });

  const categories = [
    {
      key: 'fixed-costs',
      label: 'Fixed Costs',
      icon: '🏠',
      allocated: allocations.fixedCosts,
      spent: actualSpending.fixedCosts,
      percentage: budgetPercentages.fixedCostsPercent,
      color: 'bg-neutral-600',
    },
    {
      key: 'investments',
      label: 'Investments',
      icon: '📈',
      allocated: allocations.investments,
      spent: actualSpending.investments,
      percentage: budgetPercentages.investmentsPercent,
      color: 'bg-blue-500',
    },
    {
      key: 'savings',
      label: 'Savings',
      icon: '🐷',
      allocated: allocations.savings,
      spent: actualSpending.savings,
      percentage: budgetPercentages.savingsPercent,
      color: 'bg-secondary',
    },
    {
      key: 'guilt-free-spending',
      label: 'Guilt-Free Spending',
      icon: '😊',
      allocated: allocations.guiltFreeSpending,
      spent: actualSpending.guiltFreeSpending,
      percentage: budgetPercentages.guiltFreeSpendingPercent,
      color: 'bg-amber-500',
    },
  ];

  const validateBudgetPercentages = () => {
    const total = parseFloat(editingBudget.fixedCostsPercent) +
                 parseFloat(editingBudget.investmentsPercent) +
                 parseFloat(editingBudget.savingsPercent) +
                 parseFloat(editingBudget.guiltFreeSpendingPercent);
    return total === 100;
  };

  const handleEditClick = () => {
    setEditingBudget({
      fixedCostsPercent: budgetPercentages.fixedCostsPercent.toString(),
      investmentsPercent: budgetPercentages.investmentsPercent.toString(),
      savingsPercent: budgetPercentages.savingsPercent.toString(),
      guiltFreeSpendingPercent: budgetPercentages.guiltFreeSpendingPercent.toString(),
    });
    setIsEditDialogOpen(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Budget Overview</h1>
          <p className="text-neutral-600 mt-2">
            Manage your budget using Ramit Sethi's proven framework
          </p>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleEditClick} className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Edit Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Budget Allocation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fixedCostsPercent">Fixed Costs (%)</Label>
                <Input
                  id="fixedCostsPercent"
                  type="number"
                  step="0.1"
                  value={editingBudget.fixedCostsPercent}
                  onChange={(e) => setEditingBudget({...editingBudget, fixedCostsPercent: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="investmentsPercent">Investments (%)</Label>
                <Input
                  id="investmentsPercent"
                  type="number"
                  step="0.1"
                  value={editingBudget.investmentsPercent}
                  onChange={(e) => setEditingBudget({...editingBudget, investmentsPercent: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="savingsPercent">Savings (%)</Label>
                <Input
                  id="savingsPercent"
                  type="number"
                  step="0.1"
                  value={editingBudget.savingsPercent}
                  onChange={(e) => setEditingBudget({...editingBudget, savingsPercent: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guiltFreeSpendingPercent">Guilt-Free Spending (%)</Label>
                <Input
                  id="guiltFreeSpendingPercent"
                  type="number"
                  step="0.1"
                  value={editingBudget.guiltFreeSpendingPercent}
                  onChange={(e) => setEditingBudget({...editingBudget, guiltFreeSpendingPercent: e.target.value})}
                />
              </div>
              
              {!validateBudgetPercentages() && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    Percentages must add up to 100%. Current total: {
                      parseFloat(editingBudget.fixedCostsPercent || "0") +
                      parseFloat(editingBudget.investmentsPercent || "0") +
                      parseFloat(editingBudget.savingsPercent || "0") +
                      parseFloat(editingBudget.guiltFreeSpendingPercent || "0")
                    }%
                  </p>
                </div>
              )}
              
              <Button
                onClick={() => updateBudgetMutation.mutate(editingBudget)}
                disabled={!validateBudgetPercentages() || updateBudgetMutation.isPending}
                className="w-full"
              >
                {updateBudgetMutation.isPending ? "Updating..." : "Update Budget"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const progressPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
              const isOverBudget = category.spent > category.allocated;
              const remaining = category.allocated - category.spent;
              
              return (
                <Card key={category.key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{category.icon}</span>
                        <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                      </div>
                      <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                        {Math.round(category.percentage)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-neutral-900">
                          {formatCurrency(category.spent)}
                        </span>
                        <span className="text-sm text-neutral-500">
                          of {formatCurrency(category.allocated)}
                        </span>
                      </div>
                      
                      <Progress 
                        value={Math.min(progressPercentage, 100)} 
                        className="h-2"
                      />
                      
                      <div className="text-sm">
                        {isOverBudget ? (
                          <span className="text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Over by {formatCurrency(Math.abs(remaining))}
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {formatCurrency(remaining)} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map((category) => {
                  const framework = RAMIT_FRAMEWORK[category.key as keyof typeof RAMIT_FRAMEWORK];
                  const isInRecommendedRange = category.percentage >= framework.recommended.min && 
                                             category.percentage <= framework.recommended.max;
                  
                  return (
                    <div key={category.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{category.icon}</span>
                          <div>
                            <h4 className="font-medium text-neutral-900">{category.label}</h4>
                            <p className="text-sm text-neutral-500">{framework.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={isInRecommendedRange ? "default" : "secondary"}>
                            {Math.round(category.percentage)}%
                          </Badge>
                          <p className="text-xs text-neutral-500 mt-1">
                            {framework.recommended.min}-{framework.recommended.max}% recommended
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Allocated</p>
                          <p className="font-medium">{formatCurrency(category.allocated)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Spent</p>
                          <p className="font-medium">{formatCurrency(category.spent)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Remaining</p>
                          <p className={`font-medium ${
                            (category.allocated - category.spent) < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(category.allocated - category.spent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Ramit's Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Automation First</h4>
                    <p className="text-sm text-blue-800">
                      Don't rely on willpower to manage your budget. Set up automatic transfers 
                      for investments and savings so you never have to think about them.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Conscious Spending</h4>
                    <p className="text-sm text-green-800">
                      Spend extravagantly on the things you love, and cut costs mercilessly 
                      on the things you don't. Your budget should enable your rich life.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">Focus on Big Wins</h4>
                    <p className="text-sm text-amber-800">
                      Instead of cutting out lattes, focus on the big wins: negotiate your salary, 
                      optimize your investment fees, and automate your finances.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Health Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const framework = RAMIT_FRAMEWORK[category.key as keyof typeof RAMIT_FRAMEWORK];
                    const isInRecommendedRange = category.percentage >= framework.recommended.min && 
                                               category.percentage <= framework.recommended.max;
                    const isOverBudget = category.spent > category.allocated;
                    
                    return (
                      <div key={category.key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{category.icon}</span>
                          <span className="font-medium">{category.label}</span>
                        </div>
                        <div className="flex items-center">
                          {isOverBudget ? (
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          ) : isInRecommendedRange ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                          )}
                          <span className="text-sm text-neutral-600">
                            {isOverBudget ? "Over budget" : 
                             isInRecommendedRange ? "On track" : "Needs adjustment"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
