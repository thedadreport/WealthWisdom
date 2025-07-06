import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, calculatePayPeriod, formatDateRange } from "@/lib/finance-utils";
import { PAY_SCHEDULES } from "@/lib/constants";
import type { User, Transaction } from "@shared/schema";

interface PayPeriodTimelineProps {
  user: User;
  transactions: Transaction[];
}

export default function PayPeriodTimeline({ user, transactions }: PayPeriodTimelineProps) {
  const { payPeriodStart, payPeriodEnd } = calculatePayPeriod(user.paySchedule as keyof typeof PAY_SCHEDULES);
  
  // Calculate total expenses for the period
  const totalExpenses = transactions.reduce((sum, transaction) => {
    const amount = parseFloat(transaction.amount);
    return sum + (amount < 0 ? Math.abs(amount) : 0);
  }, 0);
  
  const income = parseFloat(user.afterTaxIncome);
  const projectedBalance = income - totalExpenses;
  
  // Calculate timeline progress
  const now = new Date();
  const periodStart = new Date(payPeriodStart);
  const periodEnd = new Date(payPeriodEnd);
  const totalDays = (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
  const daysElapsed = Math.max(0, (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min((daysElapsed / totalDays) * 100, 100);

  return (
    <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Cash Flow Timeline</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-neutral-600">
            {formatDateRange(periodStart, periodEnd)}
          </span>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="w-4 h-4 bg-primary rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-neutral-500">Payday</p>
            <p className="text-xs font-medium">
              {periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              progressPercentage >= 50 ? 'bg-primary' : 'bg-neutral-300'
            }`}></div>
            <p className="text-xs text-neutral-500">Mid-period</p>
            <p className="text-xs font-medium">
              {new Date(periodStart.getTime() + (totalDays / 2) * 24 * 60 * 60 * 1000)
                .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              progressPercentage >= 100 ? 'bg-primary' : 'bg-neutral-300'
            }`}></div>
            <p className="text-xs text-neutral-500">End period</p>
            <p className="text-xs font-medium">
              {periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Projected end balance:</span>
            <span className={`font-medium ${
              projectedBalance >= 0 ? 'text-secondary' : 'text-red-600'
            }`}>
              {formatCurrency(projectedBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
