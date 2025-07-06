import { Calendar, DollarSign } from "lucide-react";
import { formatCurrency, calculatePayPeriod, getDaysRemaining, formatDateRange } from "@/lib/finance-utils";
import { PAY_SCHEDULES } from "@/lib/constants";
import type { User } from "@shared/schema";

interface WelcomeSectionProps {
  user: User;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const { payPeriodStart, payPeriodEnd } = calculatePayPeriod(user.paySchedule as keyof typeof PAY_SCHEDULES);
  const daysRemaining = getDaysRemaining(payPeriodEnd);
  const payScheduleLabel = PAY_SCHEDULES[user.paySchedule as keyof typeof PAY_SCHEDULES]?.label || user.paySchedule;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-blue-100 mb-4">
              Your current pay period: {formatDateRange(payPeriodStart, payPeriodEnd)}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Pay period ended'}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm">{payScheduleLabel} schedule</span>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-right">
              <p className="text-blue-100 text-sm">Period Income</p>
              <p className="text-3xl font-bold">
                {formatCurrency(user.afterTaxIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
