import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, calculateGoalProgress } from "@/lib/finance-utils";
import { GOAL_CATEGORIES } from "@/lib/constants";
import type { Goal } from "@shared/schema";

interface FinancialGoalsProps {
  goals: Goal[];
  onAddGoal: () => void;
}

export default function FinancialGoals({ goals, onAddGoal }: FinancialGoalsProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Financial Goals</h3>
        <Button onClick={onAddGoal} size="sm" variant="outline" className="text-primary">
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500">No goals set yet</p>
          <p className="text-sm text-neutral-400 mt-2">
            Set your first financial goal to start tracking progress
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
            const category = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];
            
            return (
              <div key={goal.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category?.icon || '🎯'}</span>
                    <h4 className="font-medium text-neutral-900">{goal.name}</h4>
                  </div>
                  <span className="text-sm text-neutral-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="mb-2" />
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
