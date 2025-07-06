import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Edit2, Trash2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, calculateGoalProgress } from "@/lib/finance-utils";
import { GOAL_CATEGORIES } from "@/lib/constants";
import GoalForm from "@/components/forms/goal-form";
import type { User, Goal } from "@shared/schema";

export default function GoalsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For demo purposes, we'll use userId = 1
  const userId = 1;
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: [`/api/goals/user/${userId}`],
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, data }: { goalId: number; data: Partial<Goal> }) => {
      return apiRequest('PATCH', `/api/goals/${goalId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/user/${userId}`] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: number) => {
      return apiRequest('DELETE', `/api/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/user/${userId}`] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addContributionMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');
      
      const newCurrentAmount = parseFloat(goal.currentAmount) + amount;
      return apiRequest('PATCH', `/api/goals/${goalId}`, {
        currentAmount: newCurrentAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/user/${userId}`] });
      toast({
        title: "Contribution added",
        description: "Your contribution has been added to the goal.",
      });
      setContributionAmount("");
      setSelectedGoalId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contribution. Please try again.",
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

  const activeGoals = goals.filter(goal => goal.isActive);
  const completedGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
    return progress >= 100;
  });

  const totalGoalAmount = activeGoals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
  const totalSavedAmount = activeGoals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);
  const overallProgress = totalGoalAmount > 0 ? (totalSavedAmount / totalGoalAmount) * 100 : 0;

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = (data: Partial<Goal>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ goalId: editingGoal.id, data });
    }
  };

  const handleAddContribution = (goalId: number) => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      addContributionMutation.mutate({ goalId, amount });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Financial Goals</h1>
          <p className="text-neutral-600 mt-2">
            Track your progress towards financial milestones
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Goal</DialogTitle>
            </DialogHeader>
            <GoalForm 
              userId={userId} 
              onSuccess={() => setIsAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-neutral-900">{activeGoals.length}</span>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-neutral-900">
                {formatCurrency(totalGoalAmount)}
              </span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-500">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-neutral-900">
                  {overallProgress.toFixed(1)}%
                </span>
                <Badge variant={overallProgress >= 50 ? "default" : "secondary"}>
                  {formatCurrency(totalSavedAmount)} saved
                </Badge>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No active goals</h3>
                <p className="text-neutral-500 mb-4">
                  Start by setting your first financial goal to begin tracking your progress.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
                const category = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];
                const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
                
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{category?.icon || '🎯'}</span>
                          <div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            <p className="text-sm text-neutral-500">{category?.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-neutral-900">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                          <Badge variant={progress >= 50 ? "default" : "secondary"}>
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        
                        <Progress value={progress} className="h-3" />
                        
                        <div className="flex justify-between text-sm text-neutral-500">
                          <span>Target: {formatCurrency(goal.targetAmount)}</span>
                          <span>Remaining: {formatCurrency(remaining)}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Add contribution"
                            value={selectedGoalId === goal.id ? contributionAmount : ""}
                            onChange={(e) => {
                              setSelectedGoalId(goal.id);
                              setContributionAmount(e.target.value);
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddContribution(goal.id)}
                            disabled={!contributionAmount || selectedGoalId !== goal.id}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No completed goals yet</h3>
                <p className="text-neutral-500">
                  Keep working towards your active goals to see them here when completed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal) => {
                const category = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];
                
                return (
                  <Card key={goal.id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{category?.icon || '🎯'}</span>
                          <div>
                            <CardTitle className="text-lg text-green-900">{goal.name}</CardTitle>
                            <p className="text-sm text-green-700">{category?.label}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-green-900">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                          <span className="text-sm text-green-700">
                            Target: {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        
                        <Progress value={100} className="h-3" />
                        
                        <p className="text-sm text-green-700">
                          🎉 Congratulations! You've achieved this goal.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Setting Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Make It Specific</h4>
                    <p className="text-sm text-blue-800">
                      Instead of "save money," set a specific target like "save $10,000 for emergency fund."
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Automate Your Progress</h4>
                    <p className="text-sm text-green-800">
                      Set up automatic transfers to your savings goals so you don't have to think about it.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 mb-2">Break It Down</h4>
                    <p className="text-sm text-amber-800">
                      Large goals can feel overwhelming. Break them into smaller, monthly targets.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">Total Goals</span>
                    <span className="text-lg font-bold">{goals.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">Active Goals</span>
                    <span className="text-lg font-bold text-blue-600">{activeGoals.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">Completed Goals</span>
                    <span className="text-lg font-bold text-green-600">{completedGoals.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <span className="font-medium">Total Saved</span>
                    <span className="text-lg font-bold text-secondary">
                      {formatCurrency(totalSavedAmount)}
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Keep Going!</h4>
                    <p className="text-sm text-blue-800">
                      You're {overallProgress.toFixed(1)}% of the way to achieving all your financial goals. 
                      Every contribution counts!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Goal Name</Label>
                <Input
                  id="editName"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editTarget">Target Amount</Label>
                <Input
                  id="editTarget"
                  type="number"
                  step="0.01"
                  value={editingGoal.targetAmount}
                  onChange={(e) => setEditingGoal({...editingGoal, targetAmount: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editCurrent">Current Amount</Label>
                <Input
                  id="editCurrent"
                  type="number"
                  step="0.01"
                  value={editingGoal.currentAmount}
                  onChange={(e) => setEditingGoal({...editingGoal, currentAmount: e.target.value})}
                />
              </div>
              
              <Button
                onClick={() => handleUpdateGoal(editingGoal)}
                disabled={updateGoalMutation.isPending}
                className="w-full"
              >
                {updateGoalMutation.isPending ? "Updating..." : "Update Goal"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
