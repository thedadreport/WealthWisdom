import { PAY_SCHEDULES } from "./constants";

export function calculatePayPeriod(
  paySchedule: keyof typeof PAY_SCHEDULES, 
  date: Date = new Date(),
  payDay?: number,
  lastPayDate?: Date
) {
  const daysInPeriod = PAY_SCHEDULES[paySchedule].daysInPeriod;
  
  let payPeriodStart: Date;
  let payPeriodEnd: Date;
  
  if (lastPayDate && payDay !== undefined) {
    // Use actual pay information to calculate accurate periods
    const lastPay = new Date(lastPayDate);
    
    if (paySchedule === 'monthly') {
      // Find the current month's pay date
      const currentPayDate = new Date(date.getFullYear(), date.getMonth(), payDay);
      
      if (date < currentPayDate) {
        // Current pay period started last month
        const prevMonthPayDate = new Date(date.getFullYear(), date.getMonth() - 1, payDay);
        payPeriodStart = new Date(prevMonthPayDate.getTime() + 24 * 60 * 60 * 1000); // Day after pay
        payPeriodEnd = currentPayDate;
      } else {
        // Current pay period started this month
        payPeriodStart = new Date(currentPayDate.getTime() + 24 * 60 * 60 * 1000); // Day after pay
        const nextMonthPayDate = new Date(date.getFullYear(), date.getMonth() + 1, payDay);
        payPeriodEnd = nextMonthPayDate;
      }
    } else if (paySchedule === 'semi-monthly') {
      // Semi-monthly usually pays on specific days like 15th and last day of month
      const day15 = new Date(date.getFullYear(), date.getMonth(), 15);
      const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      if (date <= day15) {
        payPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1);
        payPeriodEnd = day15;
      } else {
        payPeriodStart = new Date(day15.getTime() + 24 * 60 * 60 * 1000);
        payPeriodEnd = lastDayOfMonth;
      }
    } else {
      // Weekly or bi-weekly - calculate from last pay date
      const daysSinceLastPay = Math.floor((date.getTime() - lastPay.getTime()) / (1000 * 60 * 60 * 24));
      const periodsSinceLastPay = Math.floor(daysSinceLastPay / daysInPeriod);
      
      payPeriodStart = new Date(lastPay.getTime() + periodsSinceLastPay * daysInPeriod * 24 * 60 * 60 * 1000);
      payPeriodEnd = new Date(payPeriodStart.getTime() + (daysInPeriod - 1) * 24 * 60 * 60 * 1000);
    }
  } else {
    // Fallback to simplified calculation when pay info is not available
    if (paySchedule === 'monthly') {
      payPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1);
      payPeriodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else if (paySchedule === 'semi-monthly') {
      const day = date.getDate();
      if (day <= 15) {
        payPeriodStart = new Date(date.getFullYear(), date.getMonth(), 1);
        payPeriodEnd = new Date(date.getFullYear(), date.getMonth(), 15);
      } else {
        payPeriodStart = new Date(date.getFullYear(), date.getMonth(), 16);
        payPeriodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      }
    } else {
      // For weekly and bi-weekly, calculate based on a reference date
      const referenceDate = new Date('2024-01-01'); // Reference Monday
      const daysSinceReference = Math.floor((date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
      const periodsSinceReference = Math.floor(daysSinceReference / daysInPeriod);
      
      payPeriodStart = new Date(referenceDate.getTime() + periodsSinceReference * daysInPeriod * 24 * 60 * 60 * 1000);
      payPeriodEnd = new Date(payPeriodStart.getTime() + (daysInPeriod - 1) * 24 * 60 * 60 * 1000);
    }
  }
  
  return { payPeriodStart, payPeriodEnd };
}

export function getDaysRemaining(payPeriodEnd: Date): number {
  const now = new Date();
  const timeDiff = payPeriodEnd.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function calculateBudgetAllocations(income: number, budgetPercentages: {
  fixedCostsPercent: number;
  investmentsPercent: number;
  savingsPercent: number;
  guiltFreeSpendingPercent: number;
}) {
  return {
    fixedCosts: (income * budgetPercentages.fixedCostsPercent) / 100,
    investments: (income * budgetPercentages.investmentsPercent) / 100,
    savings: (income * budgetPercentages.savingsPercent) / 100,
    guiltFreeSpending: (income * budgetPercentages.guiltFreeSpendingPercent) / 100,
  };
}

export function calculateGoalProgress(current: number | string, target: number | string): number {
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const targetNum = typeof target === 'string' ? parseFloat(target) : target;
  
  if (targetNum === 0) return 0;
  return Math.min((currentNum / targetNum) * 100, 100);
}

export function getNextPayDate(paySchedule: keyof typeof PAY_SCHEDULES, currentDate: Date = new Date()): Date {
  const { payPeriodEnd } = calculatePayPeriod(paySchedule, currentDate);
  return new Date(payPeriodEnd.getTime() + 24 * 60 * 60 * 1000); // Next day after period ends
}

export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
  };
  
  const startStr = start.toLocaleDateString('en-US', options);
  const endStr = end.toLocaleDateString('en-US', options);
  
  return `${startStr} - ${endStr}`;
}
