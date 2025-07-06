import { formatCurrency } from "@/lib/finance-utils";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import type { Transaction } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Transactions</h3>
        <div className="text-center py-8">
          <p className="text-neutral-500">No transactions yet</p>
          <p className="text-sm text-neutral-400 mt-2">
            Add your first transaction to start tracking your cash flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Transactions</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const category = TRANSACTION_CATEGORIES[transaction.category as keyof typeof TRANSACTION_CATEGORIES];
          const amount = parseFloat(transaction.amount);
          const isIncome = amount > 0;
          
          return (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  isIncome ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-lg">
                    {isIncome ? '💰' : category?.icon || '💸'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{transaction.description}</p>
                  <p className="text-sm text-neutral-500">{category?.label || 'Other'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  isIncome ? 'text-secondary' : 'text-neutral-900'
                }`}>
                  {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(transaction.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
