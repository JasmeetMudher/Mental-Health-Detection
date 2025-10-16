import { RedditAnalyzer } from "@/components/RedditAnalyzer";
import { SentimentResults } from "@/components/SentimentResults";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AnalyzePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="flex-1 container mx-auto py-12">
        <RedditAnalyzer />
        <SentimentResults />
        <AnalysisHistory />
      </div>
      <Footer />
    </div>
  );
};

export default AnalyzePage;
