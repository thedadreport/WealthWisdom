import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { formatCurrency, calculatePayPeriod, formatDateRange } from "@/lib/finance-utils";
import { PAY_SCHEDULES, TRANSACTION_CATEGORIES } from "@/lib/constants";
import type { User, Transaction } from "@shared/schema";

export default function CashFlowPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(0); // 0 = current period
  
  // For demo purposes, we'll use userId = 1
  const userId = 1;
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/user/${userId}`],
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

  const { payPeriodStart, payPeriodEnd } = calculatePayPeriod(
    user.paySchedule as keyof typeof PAY_SCHEDULES,
    new Date(Date.now() - selectedPeriod * 14 * 24 * 60 * 60 * 1000)
  );

  const income = parseFloat(user.afterTaxIncome);

  // Filter transactions for current period
  const currentPeriodTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= payPeriodStart && transactionDate <= payPeriodEnd;
  });

  // Calculate cash flow data
  const totalIncome = income;
  const totalExpenses = currentPeriodTransactions.reduce((sum, t) => {
    const amount = parseFloat(t.amount);
    return sum + (amount < 0 ? Math.abs(amount) : 0);
  }, 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Calculate spending by category
  const categorySpending = currentPeriodTransactions.reduce((acc, transaction) => {
    const amount = Math.abs(parseFloat(transaction.amount));
    if (parseFloat(transaction.amount) < 0) {
      acc[transaction.category] = (acc[transaction.category] || 0) + amount;
    }
    return acc;
  }, {} as Record<string, number>);

  // Prepare chart data
  const categoryChartData = Object.entries(categorySpending).map(([category, amount]) => ({
    name: TRANSACTION_CATEGORIES[category as keyof typeof TRANSACTION_CATEGORIES]?.label || category,
    value: amount,
    color: TRANSACTION_CATEGORIES[category as keyof typeof TRANSACTION_CATEGORIES]?.color || 'bg-neutral-400',
  }));

  const COLORS = ['#2563EB', '#059669', '#DC2626', '#F59E0B'];

  // Daily spending trend
  const dailySpending = currentPeriodTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    const amount = Math.abs(parseFloat(transaction.amount));
    if (parseFloat(transaction.amount) < 0) {
      acc[date] = (acc[date] || 0) + amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const dailyChartData = Object.entries(dailySpending).map(([date, amount]) => ({
    date,
    spending: amount,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Cash flow summary cards
  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      change: "-12%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Net Cash Flow",
      value: formatCurrency(netCashFlow),
      change: netCashFlow > 0 ? "+5%" : "-5%",
      trend: netCashFlow > 0 ? "up" : "down",
      icon: TrendingUp,
      color: netCashFlow > 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Avg Daily Spending",
      value: formatCurrency(totalExpenses / 14),
      change: "+3%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Cash Flow Analysis</h1>
          <p className="text-neutral-600 mt-2">
            Track your money in and out by pay period
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod(selectedPeriod + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-neutral-600 min-w-[200px] text-center">
            {formatDateRange(payPeriodStart, payPeriodEnd)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPeriod(Math.max(0, selectedPeriod - 1))}
            disabled={selectedPeriod === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {card.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-neutral-900">
                    {card.value}
                  </span>
                  <Badge variant={card.trend === "up" ? "default" : "secondary"}>
                    {card.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900">Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalIncome)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-red-900">Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalExpenses)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                  
                  <div className={`flex items-center justify-between p-4 rounded-lg ${
                    netCashFlow > 0 ? 'bg-blue-50' : 'bg-amber-50'
                  }`}>
                    <div>
                      <p className={`text-sm font-medium ${
                        netCashFlow > 0 ? 'text-blue-900' : 'text-amber-900'
                      }`}>
                        Net Cash Flow
                      </p>
                      <p className={`text-2xl font-bold ${
                        netCashFlow > 0 ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {formatCurrency(netCashFlow)}
                      </p>
                    </div>
                    <DollarSign className={`h-8 w-8 ${
                      netCashFlow > 0 ? 'text-blue-500' : 'text-amber-500'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentPeriodTransactions.slice(0, 5).map((transaction) => {
                    const category = TRANSACTION_CATEGORIES[transaction.category as keyof typeof TRANSACTION_CATEGORIES];
                    const amount = parseFloat(transaction.amount);
                    const isIncome = amount > 0;
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-b-0">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">
                            {isIncome ? '💰' : category?.icon || '💸'}
                          </span>
                          <div>
                            <p className="font-medium text-neutral-900 text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`font-medium text-sm ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categorySpending).map(([category, amount]) => {
                    const categoryInfo = TRANSACTION_CATEGORIES[category as keyof typeof TRANSACTION_CATEGORIES];
                    const percentage = (amount / totalExpenses) * 100;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{categoryInfo?.icon}</span>
                            <span className="font-medium text-neutral-900">
                              {categoryInfo?.label}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-500">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600">
                            {formatCurrency(amount)}
                          </span>
                          <span className="text-neutral-500">
                            of {formatCurrency(totalExpenses)} total
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

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#2563EB" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Cash Flow Status</h4>
                  <p className="text-sm text-blue-800">
                    {netCashFlow > 0 
                      ? `You're saving ${formatCurrency(netCashFlow)} this pay period! This is ${((netCashFlow / totalIncome) * 100).toFixed(1)}% of your income.`
                      : `You're spending ${formatCurrency(Math.abs(netCashFlow))} more than you earn this period. Consider reviewing your expenses.`
                    }
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Spending Pattern</h4>
                  <p className="text-sm text-amber-800">
                    Your average daily spending is {formatCurrency(totalExpenses / 14)}. 
                    {totalExpenses / 14 > totalIncome / 14 
                      ? " This is above your daily income rate - consider reducing expenses."
                      : " This is within your daily income rate - good job!"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
