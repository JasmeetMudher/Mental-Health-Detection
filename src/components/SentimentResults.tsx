import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Smile, Frown, Minus } from "lucide-react";

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  totalPosts: number;
}

export const SentimentResults = () => {
  // Mock data - will be replaced with real data from API
  const mockData: SentimentData = {
    positive: 35,
    negative: 25,
    neutral: 40,
    totalPosts: 0,
  };

  if (mockData.totalPosts === 0) {
    return null;
  }

  const sentimentCards = [
    {
      title: "Positive",
      value: mockData.positive,
      icon: Smile,
      color: "positive",
      bgColor: "bg-positive/10",
      textColor: "text-positive",
      borderColor: "border-positive/30",
    },
    {
      title: "Neutral",
      value: mockData.neutral,
      icon: Minus,
      color: "neutral",
      bgColor: "bg-neutral/10",
      textColor: "text-neutral",
      borderColor: "border-neutral/30",
    },
    {
      title: "Negative",
      value: mockData.negative,
      icon: Frown,
      color: "negative",
      bgColor: "bg-negative/10",
      textColor: "text-negative",
      borderColor: "border-negative/30",
    },
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Sentiment Analysis Results</h2>
          <p className="text-muted-foreground">
            Analyzed {mockData.totalPosts} posts from the subreddit
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {sentimentCards.map((sentiment) => {
            const Icon = sentiment.icon;
            return (
              <Card 
                key={sentiment.title}
                className={`shadow-card border ${sentiment.borderColor} transition-all duration-300 hover:scale-105`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">
                      {sentiment.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${sentiment.bgColor}`}>
                      <Icon className={`h-5 w-5 ${sentiment.textColor}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${sentiment.textColor}`}>
                        {sentiment.value}%
                      </span>
                    </div>
                    <Progress 
                      value={sentiment.value} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Posts Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>Detailed post analysis will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
