import { TrendingUp, Home, PieChart, Smile } from "lucide-react";
import { formatCurrency, calculateBudgetAllocations } from "@/lib/finance-utils";
import type { User, Budget, Transaction } from "@shared/schema";

interface CashFlowCardsProps {
  user: User;
  budget?: Budget;
  transactions: Transaction[];
}

export default function CashFlowCards({ user, budget, transactions }: CashFlowCardsProps) {
  const income = parseFloat(user.afterTaxIncome);
  const usingDefaultBudget = !budget;
  
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

  const cards = [
    {
      title: "Income This Period",
      value: formatCurrency(income),
      subtitle: "After-tax income",
      icon: TrendingUp,
      color: "text-secondary",
    },
    {
      title: "Fixed Costs",
      value: formatCurrency(actualSpending.fixedCosts),
      subtitle: `${Math.round((actualSpending.fixedCosts / income) * 100)}% of income`,
      icon: Home,
      color: "text-neutral-600",
    },
    {
      title: "Investments",
      value: formatCurrency(actualSpending.investments),
      subtitle: `${Math.round((actualSpending.investments / income) * 100)}% automated`,
      icon: PieChart,
      color: "text-blue-500",
    },
    {
      title: "Savings",
      value: formatCurrency(actualSpending.savings),
      subtitle: `${Math.round((actualSpending.savings / income) * 100)}% automated`,
      icon: Smile,
      color: "text-secondary",
    },
  ];

  return (
    <div className="mb-8">
      {usingDefaultBudget && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Using recommended budget allocations.</span> 
            {" "}Set up your personal budget to see custom calculations.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-500">{card.title}</h3>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
              <p className="text-xs text-neutral-500 mt-2">{card.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
