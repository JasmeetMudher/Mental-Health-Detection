import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  return (
  <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-hero overflow-hidden pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary-glow)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mt-8">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Mental Health Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Understanding
            <span className="bg-gradient-calm bg-clip-text text-transparent"> Reddit's Sentiment </span>
            with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Analyze mental health discussions from Reddit using advanced machine learning to understand community sentiment patterns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="rounded-xl bg-card p-6 shadow-lg border border-muted">
              <h3 className="text-lg font-semibold mb-2 text-primary">Real-Time Sentiment Analysis</h3>
              <p className="text-muted-foreground">Get instant insights into Reddit posts using AI-powered models.</p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-lg border border-muted">
              <h3 className="text-lg font-semibold mb-2 text-primary">Bookmark & History</h3>
              <p className="text-muted-foreground">Save your favorite analyses and revisit your history anytime.</p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-lg border border-muted">
              <h3 className="text-lg font-semibold mb-2 text-primary">Community Trends</h3>
              <p className="text-muted-foreground">Visualize sentiment trends and patterns across mental health subreddits.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4 mb-12">
            <Button 
              size="lg" 
              className="text-lg shadow-elegant hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/analyze')}
            >
              Start Analyzing
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg border-primary/30 hover:bg-primary/5"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
