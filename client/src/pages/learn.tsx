import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lightbulb, TrendingUp, DollarSign, Target, Brain } from "lucide-react";
import { PSYCHOLOGY_INSIGHTS } from "@/lib/constants";
import type { Insight } from "@shared/schema";

export default function LearnPage() {
  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ['/api/insights'],
  });

  const morganHouselInsights = insights.filter(insight => insight.author === 'morgan-housel');
  const ramitSethiInsights = insights.filter(insight => insight.author === 'ramit-sethi');

  const learningTopics = [
    {
      title: "The Psychology of Money",
      description: "Understanding how emotions and psychology affect financial decisions",
      icon: Brain,
      color: "bg-purple-500",
      lessons: [
        "Why we make irrational money decisions",
        "The power of compound interest over time",
        "How to separate ego from investing",
        "The importance of staying the course"
      ]
    },
    {
      title: "Automation & Systems",
      description: "Building systems that work without willpower",
      icon: Target,
      color: "bg-blue-500",
      lessons: [
        "Setting up automatic transfers",
        "Creating a conscious spending plan",
        "Automating investments and savings",
        "Building systems that scale"
      ]
    },
    {
      title: "Investment Fundamentals",
      description: "Long-term wealth building strategies",
      icon: TrendingUp,
      color: "bg-green-500",
      lessons: [
        "Index fund investing basics",
        "Asset allocation strategies",
        "Tax-advantaged accounts",
        "Rebalancing your portfolio"
      ]
    },
    {
      title: "Rich Life Planning",
      description: "Defining and working towards your rich life",
      icon: DollarSign,
      color: "bg-amber-500",
      lessons: [
        "Identifying your money values",
        "Creating a vision for your rich life",
        "Balancing present and future spending",
        "Making money decisions with confidence"
      ]
    }
  ];

  const practicalTips = [
    {
      category: "Budgeting",
      tips: [
        "Use the 50/30/20 rule as a starting point, but customize based on your goals",
        "Automate your savings and investments first, then spend what's left",
        "Review and adjust your budget monthly, not daily",
        "Focus on big wins rather than cutting small expenses"
      ]
    },
    {
      category: "Investing",
      tips: [
        "Start with low-cost index funds for broad market exposure",
        "Invest consistently, regardless of market conditions",
        "Maximize employer 401(k) match before other investments",
        "Keep investing simple - complex strategies rarely beat simple ones"
      ]
    },
    {
      category: "Psychology",
      tips: [
        "Avoid checking your investments daily - it leads to emotional decisions",
        "Set up systems so you don't have to rely on willpower",
        "Focus on your own financial journey, not others'",
        "Remember that time in the market beats timing the market"
      ]
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Financial Education</h1>
        <p className="text-neutral-600 mt-2">
          Learn from the best minds in personal finance and behavioral economics
        </p>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="authors">Authors</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PSYCHOLOGY_INSIGHTS.map((insight, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant="outline">
                      {insight.author === 'Morgan Housel' ? 'Housel' : 'Sethi'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-neutral-700 leading-relaxed">
                      {insight.content}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 mb-2">Key Takeaway</h4>
                      <p className="text-sm text-blue-800">{insight.tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg ${topic.color} flex items-center justify-center mr-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <p className="text-sm text-neutral-500">{topic.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.lessons.map((lesson, lessonIndex) => (
                        <li key={lessonIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-sm text-neutral-700">{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="space-y-6">
            {practicalTips.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.category} Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="bg-neutral-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mr-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Morgan Housel</CardTitle>
                    <p className="text-sm text-neutral-500">Author of "The Psychology of Money"</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-neutral-700 leading-relaxed">
                    Morgan Housel is a partner at The Collaborative Fund and former columnist 
                    at The Motley Fool and The Wall Street Journal. His insights focus on the 
                    behavioral aspects of money and investing.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">Key Philosophy</h4>
                    <p className="text-sm text-purple-800">
                      Success in finance isn't about intelligence or knowledge - it's about behavior. 
                      The key is managing your emotions and staying consistent over time.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-900">Core Concepts:</h4>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Compound interest and time horizons</li>
                      <li>• The role of luck and risk</li>
                      <li>• Behavioral psychology in investing</li>
                      <li>• The power of "enough"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mr-4">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ramit Sethi</CardTitle>
                    <p className="text-sm text-neutral-500">Author of "I Will Teach You to Be Rich"</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-neutral-700 leading-relaxed">
                    Ramit Sethi is a personal finance expert and entrepreneur who focuses on 
                    practical systems for building wealth. His approach emphasizes automation 
                    and conscious spending rather than restriction.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Key Philosophy</h4>
                    <p className="text-sm text-green-800">
                      Don't rely on willpower - build systems that work automatically. 
                      Focus on the big wins and spend extravagantly on what you love.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-neutral-900">Core Concepts:</h4>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Automation-first approach</li>
                      <li>• Conscious spending plan</li>
                      <li>• Focus on big wins over small cuts</li>
                      <li>• Rich life planning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How These Philosophies Work Together</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Psychology + Systems</h4>
                  <p className="text-sm text-blue-800">
                    Housel's insights about human psychology inform why Sethi's automated systems work so well. 
                    When you remove emotion from financial decisions, you're more likely to succeed.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Long-term Thinking</h4>
                  <p className="text-sm text-green-800">
                    Both authors emphasize the importance of long-term thinking and consistency. 
                    Small, consistent actions compound over time to create significant results.
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
