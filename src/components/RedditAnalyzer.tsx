// ...existing code...
import { useEffect, useState } from "react";
import { Client } from "@gradio/client";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Bookmark, ExternalLink, Image as ImageIcon, MessageSquare, Link as LinkIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookmarkedSubreddits } from "@/components/BookmarkedSubreddits";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

// Custom legend renderer to hide icon
const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap gap-4 mt-2">
      {payload && payload.map((entry: any, idx: number) => (
        <li key={`legend-item-${idx}`} style={{ color: entry.color, listStyle: "none" }}>
          {entry.value !== 'value' ? entry.value : ''}
        </li>
      ))}
    </ul>
  );
};

export const RedditAnalyzer = () => {
  const [subreddit, setSubreddit] = useState("");
  const [limit, setLimit] = useState("10"); // Fetch ten posts
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState("new");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [subredditInfo, setSubredditInfo] = useState<any | null>(null);
  const [analysis, setAnalysis] = useState<string[] | null>(null);

  const toggleBookmark = async () => {
    if (!subreddit.trim()) {
      toast.error("Please enter a subreddit name");
      return;
    }

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarked_subreddits")
          .delete()
          .eq("subreddit", subreddit.toLowerCase().trim());

        if (error) throw error;
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("bookmarked_subreddits")
          .insert({
            user_id: user.id,
            subreddit: subreddit.toLowerCase().trim(),
          });

        if (error) {
          if (error.code === "23505") {
            toast.info("Already bookmarked");
            setIsBookmarked(true);
          } else {
            throw error;
          }
        } else {
          setIsBookmarked(true);
          toast.success("Bookmark added");
        }
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleAnalyze = async () => {
    if (!subreddit.trim()) {
      toast.error("Please enter a subreddit name");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    toast.info("Fetching posts...");
    try {
      // Fetch subreddit info
      const infoUrl = `https://corsproxy.io/?https://www.reddit.com/r/${subreddit}/about.json`;
      const infoRes = await fetch(infoUrl);
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        setSubredditInfo(infoData.data);
      } else {
        setSubredditInfo(null);
      }
  // Fetch ten posts
  const url = `https://corsproxy.io/?https://www.reddit.com/r/${subreddit}/${sortBy}.json?limit=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      if (!data.data || !Array.isArray(data.data.children) || data.data.children.length === 0) {
        toast.error("No posts found.");
        setPosts([]);
        return;
      }
  const fetchedPosts = data.data.children.slice(0, 10).map((child: any) => ({
        ...child.data,
        _fallbackId: child.data.id || child.data.name || 0
      }));
      setPosts(fetchedPosts);
      toast.success("Posts fetched!");
      // Analyze each post's text using Gradio
      const client = await Client.connect("https://e279a2c9138c9a06c2.gradio.live/");
      const analyses: string[] = [];
      for (const post of fetchedPosts) {
        const text = post.selftext || post.title || "";
        if (text) {
          try {
            const result = await client.predict("/predict", { text });
            analyses.push(String(result.data));
          } catch (err) {
            analyses.push("Analysis failed.");
          }
        } else {
          analyses.push("No text to analyze.");
        }
      }
      setAnalysis(analyses);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };


  // Parse new analysis format and aggregate sentiment
  const sentimentLabels = [
    "Suicidal",
    "Depression",
    "Bipolar",
    "Anxiety",
    "Stress",
    "Normal",
    "Personality disorder"
  ];


  // Count only the predicted sentiment label for each post
  const sentimentSummary = sentimentLabels.reduce((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {} as Record<string, number>);

  if (Array.isArray(analysis)) {
    analysis.forEach((result) => {
      // Extract predicted sentiment from result string
      const match = result.match(/\*\*🧠 Predicted Sentiment:\*\* ([^\n]+)/);
      if (match && sentimentLabels.includes(match[1])) {
        sentimentSummary[match[1]] += 1;
      } else {
        sentimentSummary["Unknown"] += 1;
      }
    });
  }

  // Prepare chart data
  const sentimentChartData = sentimentLabels.map((label) => ({
    name: label,
    value: sentimentSummary[label]
  }));

  const COLORS = ["#3b82f6", "#6366f1", "#f59e42", "#38bdf8", "#818cf8", "#22d3ee", "#f87171"];

  return (
    <section id="analyzer" className="min-h-screen py-20 px-4 bg-gradient-to-br from-background via-background/95 to-muted/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto max-w-5xl space-y-8">
        {/* Enhanced Header */}
        <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Analyze Reddit Discussions
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground/80">
              Enter a subreddit to fetch recent posts and analyze community sentiment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subreddit Info Card */}
            {subredditInfo && (
              <div className="mb-6 flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
                {subredditInfo.icon_img && (
                  <img src={subredditInfo.icon_img} alt="icon" className="h-16 w-16 rounded-full border-2 border-primary/20 shadow-md" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-xl text-primary mb-1">r/{subredditInfo.display_name}</div>
                  <div className="text-muted-foreground text-sm mb-3 leading-relaxed">{subredditInfo.public_description}</div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                    {subredditInfo.subscribers?.toLocaleString() || '0'} subscribers
                  </Badge>
                </div>
              </div>
            )}
            <div className="space-y-6 p-6 bg-gradient-to-br from-muted/20 to-muted/5 rounded-2xl border border-muted/20">
              <div className="space-y-3">
                <Label htmlFor="subreddit" className="text-sm font-semibold text-foreground/90">Subreddit Name</Label>
                <div className="relative">
                  <Input
                    id="subreddit"
                    placeholder="e.g., technology, programming, science"
                    value={subreddit}
                    onChange={(e) => setSubreddit(e.target.value)}
                    disabled={isLoading}
                    className="pr-12 h-12 text-base border-2 border-muted/30 focus:border-primary/50 bg-background/50 backdrop-blur-sm transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={toggleBookmark}
                    disabled={isLoading}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-primary/10 transition-colors"
                  >
                    <Bookmark className={`h-5 w-5 transition-colors ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`} />
                  </Button>
                </div>
              </div>
              {/* Advanced Filters & Sorting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-xl border border-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-sm font-medium text-foreground/80">Number of Posts</Label>
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    disabled={isLoading}
                    className="h-10 border-muted/30 focus:border-primary/50 bg-background/50 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort" className="text-sm font-medium text-foreground/80">Sort By</Label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    disabled={isLoading}
                    className="w-full h-10 px-3 py-2 border-2 border-muted/30 rounded-md bg-background/50 focus:border-primary/50 focus:outline-none transition-all duration-200"
                  >
                    <option value="new">🔥 New</option>
                    <option value="hot">🌟 Hot</option>
                    <option value="top">🏆 Top</option>
                    <option value="rising">📈 Rising</option>
                    <option value="controversial">⚡ Controversial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter" className="text-sm font-medium text-foreground/80">Filter by Keyword</Label>
                  <Input
                    id="filter"
                    placeholder="Keyword, author, flair..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    disabled={isLoading}
                    className="h-10 border-muted/30 focus:border-primary/50 bg-background/50 transition-all duration-200"
                  />
                </div>
              </div>
              {/* Export/Share Button */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const doc = new jsPDF();
                    let y = 20;
                    doc.setFontSize(18);
                    doc.text("Reddit Analysis Results", 10, y);
                    y += 12;
                    posts.forEach((post, idx) => {
                      doc.setFontSize(14);
                      doc.text(`Post ${idx + 1}`, 10, y);
                      y += 10;
                      doc.setFontSize(12);
                      doc.text(`Title:`, 10, y);
                      doc.setFontSize(11);
                      y += 7;
                      const titleLines = doc.splitTextToSize(post.title || "No title", 180);
                      doc.text(titleLines, 15, y);
                      y += titleLines.length * 7 + 4;
                      doc.setFontSize(12);
                      doc.text(`Author: ${post.author}`, 10, y);
                      y += 7;
                      doc.text(`Flair: ${post.link_flair_text || "No Flair"}`, 10, y);
                      y += 7;
                      doc.text(`Text:`, 10, y);
                      y += 7;
                      doc.setFontSize(11);
                      const selftext = post.selftext?.length ? post.selftext : "No text";
                      const selftextLines = doc.splitTextToSize(selftext, 180);
                      doc.text(selftextLines, 15, y);
                      y += selftextLines.length * 7 + 4;
                      if (Array.isArray(analysis) && analysis[idx]) {
                        doc.setFontSize(12);
                        doc.text(`Analysis:`, 10, y);
                        y += 7;
                        doc.setFontSize(11);
                        const analysisLines = doc.splitTextToSize(analysis[idx], 180);
                        doc.text(analysisLines, 15, y);
                        y += analysisLines.length * 7 + 4;
                      }
                      y += 12;
                      if (y > 260) {
                        doc.addPage();
                        y = 20;
                      }
                    });
                    doc.save("reddit_analysis.pdf");
                    toast.success("PDF exported!");
                  }}
                  className="bg-gradient-to-r from-secondary/80 to-secondary hover:from-secondary hover:to-secondary/90 border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-200"
                >
                  📄 Export Results
                </Button>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Analyzing subreddit...
                </>
              ) : (
                <>
                  <Search className="mr-3 h-6 w-6" />
                  Analyze Subreddit
                </>
              )}
            </Button>
            {/* Subreddit Info */}
            {subredditInfo && (
              <Card className="my-6">
                <CardHeader className="flex flex-row items-center gap-4">
                  {subredditInfo.icon_img && (
                    <img src={subredditInfo.icon_img} alt="icon" className="h-10 w-10 rounded-full" />
                  )}
                  <div>
                    <CardTitle className="text-lg">r/{subredditInfo.display_name}</CardTitle>
                    <CardDescription>{subredditInfo.public_description}</CardDescription>
                    <Badge variant="outline">{subredditInfo.subscribers} subscribers</Badge>
                  </div>
                </CardHeader>
              </Card>
            )}
            {/* Posts List */}
            {isLoading ? (
              <div className="mt-8 grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl animate-pulse border border-muted/20" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  📋 Fetched Posts
                </h3>
                <div className="flex flex-col gap-6">
                  {posts
                    .filter(post => {
                      if (!filter.trim()) return true;
                      const keyword = filter.trim().toLowerCase();
                      return (
                        post.title?.toLowerCase().includes(keyword) ||
                        post.selftext?.toLowerCase().includes(keyword) ||
                        post.author?.toLowerCase().includes(keyword) ||
                        post.link_flair_text?.toLowerCase().includes(keyword)
                      );
                    })
                    .map((post, idx) => (
                      <div key={post._fallbackId || idx} className="group border-2 border-muted/20 rounded-2xl p-6 bg-gradient-to-br from-card/50 to-card/30 hover:from-card/70 hover:to-card/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                        <div className="flex gap-4 items-start">
                          {post.thumbnail && post.thumbnail.startsWith("http") && (
                            <img src={post.thumbnail} alt="thumbnail" className="h-20 w-20 object-cover rounded-xl border-2 border-muted/20 shadow-sm flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex gap-3 items-center mb-3 flex-wrap">
                              <span className="font-bold text-xl text-foreground leading-tight">{post.title}</span>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                {post.link_flair_text || "No Flair"}
                              </Badge>
                              <div className="flex gap-2 text-muted-foreground">
                                {post.is_video ? (
                                  <Video className="h-4 w-4" />
                                ) : post.post_hint === "image" ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : post.post_hint === "link" ? (
                                  <LinkIcon className="h-4 w-4" />
                                ) : (
                                  <MessageSquare className="h-4 w-4" />
                                )}
                              </div>
                            </div>
                            <div className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
                              <span className="font-medium">by</span>
                              <a
                                href={`https://www.reddit.com/user/${post.author}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-semibold hover:underline"
                              >
                                {post.author}
                              </a>
                              <span className="text-muted-foreground/60">•</span>
                              <span>{new Date(post.created_utc * 1000).toLocaleDateString()}</span>
                            </div>
                            {post.selftext && (
                              <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-muted/10 text-sm leading-relaxed">
                                {post.selftext}
                              </div>
                            )}
                            <div className="flex gap-3 mt-4">
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Post
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(post.url)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                Share
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.success("Post saved locally!")}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                        {/* Sentiment Analysis Result for each post */}
                        {Array.isArray(analysis) && analysis[idx] && (
                          <div className="mt-6 p-4 border-2 border-primary/10 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5">
                            <h4 className="font-bold mb-3 text-primary flex items-center gap-2">
                              🧠 Analysis Result
                            </h4>
                              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                                {(() => {
                                  // Remove 'cleaned text', asterisks, and leading gap from analysis result
                                  let result = analysis[idx] || "";
                                  // Remove lines containing 'cleaned text'
                                  result = result
                                    .split('\n')
                                    .filter(line => !/cleaned text/i.test(line))
                                    .join('\n');
                                  // Remove all asterisks
                                  result = result.replace(/\*/g, "");
                                  // Remove leading whitespace/gap
                                  // Remove leading whitespace/gap for all lines (including confidence/probabilities)
                                  result = result
                                    .split('\n')
                                    .map(line => line.replace(/^\s+/, ""))
                                    .join('\n');
                                  return result;
                                })()}
                              </pre>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-muted-foreground text-lg">No posts found for this subreddit.</p>
                <p className="text-muted-foreground/60 text-sm mt-2">Try a different subreddit or check your search terms.</p>
              </div>
            )}
            {/* Post Details Modal */}
            <Dialog open={!!selectedPost} onOpenChange={open => !open && setSelectedPost(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedPost?.title}</DialogTitle>
                  <DialogDescription>
                    <div className="text-muted-foreground text-sm mb-2">
                      by {selectedPost?.author && (
                        <a
                          href={`https://www.reddit.com/user/${selectedPost.author}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold hover:underline"
                        >
                          {selectedPost.author}
                        </a>
                      )}
                    </div>
                    {selectedPost?.selftext && <div className="mb-2 whitespace-pre-line">{selectedPost.selftext}</div>}
                    {selectedPost?.url && (
                      <a href={selectedPost.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Open Original
                      </a>
                    )}
                    {/* Comments preview (fetch if needed) */}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        {/* Sentiment Summary & Visualization at the bottom */}
        {Array.isArray(analysis) && analysis.length > 0 && (
          <Card className="mt-12 shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent flex items-center gap-3">
                🧠 Sentiment Analysis
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground/80">
                Comprehensive overview of sentiment across all analyzed posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    📊 Sentiment Distribution
                  </h4>
                  <div className="w-full h-72 p-4 bg-gradient-to-br from-muted/10 to-muted/5 rounded-2xl border border-muted/20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sentimentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {sentimentChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              className="drop-shadow-sm"
                            />
                          ))}
                        </Bar>
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend content={CustomLegend} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    🥧 Sentiment Breakdown
                  </h4>
                  <div className="w-full h-72 p-4 bg-gradient-to-br from-muted/10 to-muted/5 rounded-2xl border border-muted/20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={30}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {sentimentChartData.map((entry, index) => (
                            <Cell
                              key={`cell-pie-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              className="drop-shadow-md"
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '2px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend content={CustomLegend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-muted/20">
                {sentimentLabels.slice(0, 4).map((label, idx) => {
                  const count = sentimentSummary[label] || 0;
                  const percentage = analysis.length > 0 ? ((count / analysis.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={label} className="text-center p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                      <div className="text-2xl font-bold text-primary">{count}</div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground/70">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};
