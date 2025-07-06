import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, calculateBudgetAllocations } from "@/lib/finance-utils";
import { TRANSACTION_CATEGORIES, RAMIT_FRAMEWORK } from "@/lib/constants";
import type { User, Budget, Transaction } from "@shared/schema";

interface BudgetFrameworkProps {
  user: User;
  budget?: Budget;
  transactions: Transaction[];
}

export default function BudgetFramework({ user, budget, transactions }: BudgetFrameworkProps) {
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Your Money Plan</h3>
        <Badge variant="secondary" className="bg-blue-100 text-primary">
          Ramit's Framework
        </Badge>
      </div>
      
      <div className="space-y-6">
        {categories.map((category) => {
          const progressPercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
          const isOverBudget = category.spent > category.allocated;
          const framework = RAMIT_FRAMEWORK[category.key as keyof typeof RAMIT_FRAMEWORK];
          
          return (
            <div key={category.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xl mr-3">{category.icon}</span>
                  <span className="font-medium text-neutral-900">{category.label}</span>
                </div>
                <span className="text-sm text-neutral-500">
                  {framework.recommended.min}-{framework.recommended.max}% recommended
                </span>
              </div>
              
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    isOverBudget ? 'bg-red-500' : category.color
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {formatCurrency(category.spent)} spent
                </span>
                <span className={`font-medium ${
                  isOverBudget ? 'text-red-500' : 
                  category.percentage >= framework.recommended.min ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {Math.round(category.percentage)}% of income
                  {isOverBudget && ' (Over budget)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
