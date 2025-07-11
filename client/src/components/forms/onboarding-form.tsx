import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, insertBudgetSchema } from "@shared/schema";
import { PAY_SCHEDULES } from "@/lib/constants";

const userFormSchema = insertUserSchema.extend({
  afterTaxIncome: z.string().min(1, "Income is required"),
  payDay: z.number().optional(),
  lastPayDate: z.string().optional(),
}).transform((data) => ({
  ...data,
  lastPayDate: data.lastPayDate ? new Date(data.lastPayDate) : undefined,
}));

const budgetFormSchema = insertBudgetSchema.extend({
  fixedCostsPercent: z.string().min(1, "Fixed costs percentage is required"),
  investmentsPercent: z.string().min(1, "Investments percentage is required"),
  savingsPercent: z.string().min(1, "Savings percentage is required"),
  guiltFreeSpendingPercent: z.string().min(1, "Guilt-free spending percentage is required"),
}).transform((data) => ({
  ...data,
  fixedCostsPercent: data.fixedCostsPercent,
  investmentsPercent: data.investmentsPercent,
  savingsPercent: data.savingsPercent,
  guiltFreeSpendingPercent: data.guiltFreeSpendingPercent,
}));

export default function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      paySchedule: "bi-weekly",
      afterTaxIncome: "",
      isOnboarded: false,
    },
  });

  const budgetForm = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      fixedCostsPercent: "50",
      investmentsPercent: "10",
      savingsPercent: "5",
      guiltFreeSpendingPercent: "35",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userFormSchema>) => {
      return apiRequest('POST', '/api/users', data);
    },
    onSuccess: (response) => {
      response.json().then((user) => {
        setUserId(user.id);
        setStep(2);
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof budgetFormSchema>) => {
      const budgetData = {
        ...data,
        userId: userId!,
      };
      
      console.log('Submitting budget data:', budgetData);
      return apiRequest('POST', '/api/budgets', budgetData);
    },
    onSuccess: async () => {
      try {
        // Update user to mark as onboarded
        await apiRequest('PATCH', `/api/users/${userId}`, { isOnboarded: true });
        
        toast({
          title: "Welcome to FlowBudget!",
          description: "Your account has been set up successfully.",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } catch (error) {
        console.error('Error updating user onboarding status:', error);
        // Still show success for budget creation
        toast({
          title: "Budget Created",
          description: "Your budget has been set up successfully.",
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    },
    onError: (error) => {
      console.error('Budget creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onUserSubmit = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate(data);
  };

  const onBudgetSubmit = (data: z.infer<typeof budgetFormSchema>) => {
    createBudgetMutation.mutate(data);
  };

  // Validate budget percentages add up to 100
  const validateBudgetPercentages = () => {
    const fixedCosts = parseFloat(budgetForm.watch("fixedCostsPercent") || "0");
    const investments = parseFloat(budgetForm.watch("investmentsPercent") || "0");
    const savings = parseFloat(budgetForm.watch("savingsPercent") || "0");
    const guiltFree = parseFloat(budgetForm.watch("guiltFreeSpendingPercent") || "0");
    
    const total = fixedCosts + investments + savings + guiltFree;
    // Allow for small floating-point precision issues
    return Math.abs(total - 100) < 0.01;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to FlowBudget</h1>
        <p className="text-neutral-600 text-center">
          Let's set up your personalized budget using proven financial principles
        </p>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-neutral-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-neutral-200'}`}></div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Tell us about yourself and your pay schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...userForm.register("firstName")}
                  />
                  {userForm.formState.errors.firstName && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...userForm.register("lastName")}
                  />
                  {userForm.formState.errors.lastName && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...userForm.register("email")}
                />
                {userForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{userForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paySchedule">Pay Schedule</Label>
                <Select value={userForm.watch("paySchedule")} onValueChange={(value) => userForm.setValue("paySchedule", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAY_SCHEDULES).map(([key, schedule]) => (
                      <SelectItem key={key} value={key}>
                        {schedule.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userForm.formState.errors.paySchedule && (
                  <p className="text-sm text-red-600">{userForm.formState.errors.paySchedule.message}</p>
                )}
              </div>

              {userForm.watch("paySchedule") && (
                <div className="space-y-2">
                  <Label htmlFor="payDay">
                    {userForm.watch("paySchedule") === "monthly" || userForm.watch("paySchedule") === "semi-monthly" 
                      ? "Pay Day (Day of Month)" 
                      : "Pay Day (Day of Week)"}
                  </Label>
                  <Select 
                    value={userForm.watch("payDay")?.toString()} 
                    onValueChange={(value) => userForm.setValue("payDay", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        userForm.watch("paySchedule") === "monthly" || userForm.watch("paySchedule") === "semi-monthly"
                          ? "Select day of month"
                          : "Select day of week"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {userForm.watch("paySchedule") === "monthly" || userForm.watch("paySchedule") === "semi-monthly" ? (
                        // Day of month (1-31)
                        Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            {day === 1 ? "1st" : day === 2 ? "2nd" : day === 3 ? "3rd" : `${day}th`}
                          </SelectItem>
                        ))
                      ) : (
                        // Day of week (0=Sunday, 1=Monday, etc.)
                        [
                          { value: "0", label: "Sunday" },
                          { value: "1", label: "Monday" }, 
                          { value: "2", label: "Tuesday" },
                          { value: "3", label: "Wednesday" },
                          { value: "4", label: "Thursday" },
                          { value: "5", label: "Friday" },
                          { value: "6", label: "Saturday" }
                        ].map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {userForm.formState.errors.payDay && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.payDay.message}</p>
                  )}
                </div>
              )}

              {userForm.watch("paySchedule") && userForm.watch("payDay") !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="lastPayDate">Most Recent Pay Date</Label>
                  <Input
                    id="lastPayDate"
                    type="date"
                    {...userForm.register("lastPayDate")}
                  />
                  <p className="text-xs text-gray-500">
                    This helps us calculate your current pay period accurately
                  </p>
                  {userForm.formState.errors.lastPayDate && (
                    <p className="text-sm text-red-600">{userForm.formState.errors.lastPayDate.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="afterTaxIncome">After-Tax Income (per pay period)</Label>
                <Input
                  id="afterTaxIncome"
                  type="number"
                  step="0.01"
                  placeholder="2800.00"
                  {...userForm.register("afterTaxIncome")}
                />
                {userForm.formState.errors.afterTaxIncome && (
                  <p className="text-sm text-red-600">{userForm.formState.errors.afterTaxIncome.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Creating Account..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Framework</CardTitle>
            <CardDescription>
              Set up your budget using Ramit Sethi's proven framework. 
              Make sure percentages add up to 100%.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fixedCostsPercent">Fixed Costs (50-60% recommended)</Label>
                <Input
                  id="fixedCostsPercent"
                  type="number"
                  step="0.1"
                  placeholder="50"
                  {...budgetForm.register("fixedCostsPercent")}
                />
                <p className="text-xs text-neutral-500">
                  Rent, utilities, insurance, minimum debt payments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investmentsPercent">Investments (10-20% recommended)</Label>
                <Input
                  id="investmentsPercent"
                  type="number"
                  step="0.1"
                  placeholder="10"
                  {...budgetForm.register("investmentsPercent")}
                />
                <p className="text-xs text-neutral-500">
                  401k, IRA, index funds, stocks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="savingsPercent">Savings (5-10% recommended)</Label>
                <Input
                  id="savingsPercent"
                  type="number"
                  step="0.1"
                  placeholder="5"
                  {...budgetForm.register("savingsPercent")}
                />
                <p className="text-xs text-neutral-500">
                  Emergency fund, vacation, goals
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guiltFreeSpendingPercent">Guilt-Free Spending (20-35% recommended)</Label>
                <Input
                  id="guiltFreeSpendingPercent"
                  type="number"
                  step="0.1"
                  placeholder="35"
                  {...budgetForm.register("guiltFreeSpendingPercent")}
                />
                <p className="text-xs text-neutral-500">
                  Dining out, entertainment, hobbies, shopping
                </p>
              </div>

              {!validateBudgetPercentages() && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    Your percentages must add up to 100%. Current total: {
                      (parseFloat(budgetForm.watch("fixedCostsPercent") || "0") +
                      parseFloat(budgetForm.watch("investmentsPercent") || "0") +
                      parseFloat(budgetForm.watch("savingsPercent") || "0") +
                      parseFloat(budgetForm.watch("guiltFreeSpendingPercent") || "0")).toFixed(1)
                    }%
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createBudgetMutation.isPending || !validateBudgetPercentages()}
              >
                {createBudgetMutation.isPending ? "Setting Up Budget..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
