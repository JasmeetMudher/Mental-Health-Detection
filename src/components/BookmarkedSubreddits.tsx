import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Bookmark {
  id: string;
  subreddit: string;
  created_at: string;
}

interface BookmarkedSubredditsProps {
  onSelect?: (subreddit: string) => void;
}

export const BookmarkedSubreddits = ({ onSelect }: BookmarkedSubredditsProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from("bookmarked_subreddits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error: any) {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await supabase.from("bookmarked_subreddits").delete().eq("id", id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success("Bookmark removed");
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

  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Bookmarked Subreddits
        </CardTitle>
        <CardDescription>Quick access to your favorite subreddits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center gap-2 px-3 py-1.5 border rounded-full hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => onSelect?.(bookmark.subreddit)}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                r/{bookmark.subreddit}
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => deleteBookmark(bookmark.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
