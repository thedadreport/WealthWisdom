import { useQuery } from "@tanstack/react-query";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Insight } from "@shared/schema";

export default function PsychologyInsights() {
  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['/api/insights'],
  });

  // Get a random insight
  const randomInsight = insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : null;

  if (!randomInsight) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 text-amber-600 mr-3" />
          <h3 className="font-semibold text-amber-900">Money Psychology Tip</h3>
        </div>
        <p className="text-sm text-amber-800">
          Loading insights...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-5 w-5 text-amber-600 mr-3" />
        <h3 className="font-semibold text-amber-900">Money Psychology Tip</h3>
      </div>
      <h4 className="font-medium text-amber-900 mb-2">{randomInsight.title}</h4>
      <p className="text-sm text-amber-800 mb-4 leading-relaxed">
        {randomInsight.content}
      </p>
      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <p className="text-xs text-amber-700">
          {randomInsight.author === 'morgan-housel' ? 'Morgan Housel' : 'Ramit Sethi'} • {randomInsight.category}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 p-0">
        Read more insights
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
