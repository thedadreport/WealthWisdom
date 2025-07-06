import { useQuery } from "@tanstack/react-query";
import { Lightbulb, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Insight } from "@shared/schema";
import { useState, useEffect } from "react";

export default function PsychologyInsights() {
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['/api/insights'],
  });

  // Initialize with a random insight
  useEffect(() => {
    if (insights.length > 0) {
      setCurrentInsightIndex(Math.floor(Math.random() * insights.length));
    }
  }, [insights]);

  const currentInsight = insights[currentInsightIndex];

  const nextInsight = () => {
    if (insights.length > 1) {
      setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
    }
  };

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
      <h4 className="font-medium text-amber-900 mb-2">{currentInsight.title}</h4>
      <p className="text-sm text-amber-800 mb-4 leading-relaxed">
        {currentInsight.content}
      </p>
      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <p className="text-xs text-amber-700">
          {currentInsight.author === 'morgan-housel' ? 'Morgan Housel' : 'Ramit Sethi'} • {currentInsight.category}
        </p>
      </div>
      <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 p-0">
        Read more insights
        <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
