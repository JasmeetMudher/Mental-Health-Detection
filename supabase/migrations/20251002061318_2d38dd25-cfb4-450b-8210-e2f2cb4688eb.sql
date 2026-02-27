-- Create table for saved analysis history
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subreddit TEXT NOT NULL,
  post_limit INTEGER NOT NULL,
  positive_count INTEGER NOT NULL,
  negative_count INTEGER NOT NULL,
  neutral_count INTEGER NOT NULL,
  total_posts INTEGER NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analysis history"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis history"
ON public.analysis_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history"
ON public.analysis_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create table for bookmarked subreddits
CREATE TABLE public.bookmarked_subreddits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subreddit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subreddit)
);

-- Enable RLS
ALTER TABLE public.bookmarked_subreddits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarked_subreddits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarked_subreddits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarked_subreddits
FOR DELETE
USING (auth.uid() = user_id);