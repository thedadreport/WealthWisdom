import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertGoalSchema } from "@shared/schema";
import { GOAL_CATEGORIES } from "@/lib/constants";

const formSchema = insertGoalSchema.extend({
  targetAmount: z.string().min(1, "Target amount is required"),
  currentAmount: z.string().optional(),
});

interface GoalFormProps {
  userId: number;
  onSuccess?: () => void;
}

export default function GoalForm({ userId, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId,
      name: "",
      targetAmount: "",
      currentAmount: "0",
      category: "emergency",
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const goalData = {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : 0,
      };
      
      return apiRequest('POST', '/api/goals', goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/user/${userId}`] });
      toast({
        title: "Goal created",
        description: "Your financial goal has been set successfully.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createGoalMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          placeholder="Emergency Fund, Vacation, etc."
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GOAL_CATEGORIES).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category && (
          <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAmount">Target Amount</Label>
        <Input
          id="targetAmount"
          type="number"
          step="0.01"
          placeholder="10000.00"
          {...form.register("targetAmount")}
        />
        {form.formState.errors.targetAmount && (
          <p className="text-sm text-red-600">{form.formState.errors.targetAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentAmount">Current Amount (optional)</Label>
        <Input
          id="currentAmount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...form.register("currentAmount")}
        />
        {form.formState.errors.currentAmount && (
          <p className="text-sm text-red-600">{form.formState.errors.currentAmount.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createGoalMutation.isPending}
      >
        {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
      </Button>
    </form>
  );
}
