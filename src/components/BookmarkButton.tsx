import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookmarkButtonProps {
  subreddit: string;
}

export const BookmarkButton = ({ subreddit }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBookmark();
  }, [subreddit]);

  const checkBookmark = async () => {
    if (!subreddit) return;
    
    const { data } = await supabase
      .from("bookmarked_subreddits")
      .select("id")
      .eq("subreddit", subreddit)
      .single();

    setIsBookmarked(!!data);
  };

  const toggleBookmark = async () => {
    if (!subreddit) {
      toast.error("Enter a subreddit first");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isBookmarked) {
        await supabase
          .from("bookmarked_subreddits")
          .delete()
          .eq("subreddit", subreddit)
          .eq("user_id", user.id);
        toast.success("Bookmark removed");
        setIsBookmarked(false);
      } else {
        await supabase
          .from("bookmarked_subreddits")
          .insert({ subreddit, user_id: user.id });
        toast.success("Subreddit bookmarked");
        setIsBookmarked(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleBookmark}
      disabled={loading}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
    </Button>
  );
};
