import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalysisRecord {
  id: string;
  subreddit: string;
  post_limit: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_posts: number;
  analyzed_at: string;
}

export const AnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .order("analyzed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await supabase.from("analysis_history").delete().eq("id", id);
      setHistory(history.filter(h => h.id !== id));
      toast.success("Record deleted");
    } catch (error: any) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Analyses
          </CardTitle>
          <CardDescription>Your last 10 sentiment analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((record) => {
              const positivePercent = Math.round((record.positive_count / record.total_posts) * 100);
              const negativePercent = Math.round((record.negative_count / record.total_posts) * 100);
              const neutralPercent = Math.round((record.neutral_count / record.total_posts) * 100);

              return (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">r/{record.subreddit}</h3>
                      <Badge variant="outline">{record.total_posts} posts</Badge>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-positive">😊 {positivePercent}%</span>
                      <span className="text-neutral">😐 {neutralPercent}%</span>
                      <span className="text-negative">😞 {negativePercent}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(record.analyzed_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecord(record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
