import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/finance-utils";
import type { Automation } from "@shared/schema";

interface AutomationStatusProps {
  automations: Automation[];
}

export default function AutomationStatus({ automations }: AutomationStatusProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
      <div className="flex items-center mb-4">
        <Bot className="h-5 w-5 text-primary mr-3" />
        <h3 className="font-semibold text-neutral-900">Automation Status</h3>
      </div>
      
      {automations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-500">No automations set up</p>
          <p className="text-sm text-neutral-400 mt-2">
            Set up automatic transfers to build wealth effortlessly
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map((automation) => (
            <div key={automation.id} className="flex items-center justify-between">
              <div>
                <span className="text-sm text-neutral-600">{automation.name}</span>
                <p className="text-xs text-neutral-400">
                  {formatCurrency(automation.amount)} • {automation.frequency}
                </p>
              </div>
              <Badge variant={automation.isActive ? "default" : "secondary"}>
                {automation.isActive ? 'Active' : 'Paused'}
              </Badge>
            </div>
          ))}
        </div>
      )}
      
      <Button variant="outline" className="w-full mt-4">
        Manage Automations
      </Button>
    </div>
  );
}
