import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Hero } from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session && !loading) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <ThemeToggle />
        </div>
        <Hero />
        <section className="max-w-5xl mx-auto mt-16 mb-12 px-6 py-14 rounded-2xl bg-gradient-to-br from-card/80 to-muted/40 shadow-2xl border border-primary/10 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-shrink-0 flex flex-col items-center justify-center md:w-1/3">
              <img src="/pulse.svg" alt="MindPulse Logo" className="w-20 h-20 mb-4 drop-shadow-lg" />
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-2">AI for Mental Health</span>
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-extrabold mb-4 text-primary tracking-tight">About MindPulse</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                <span className="font-semibold text-foreground">MindPulse</span> is an AI-powered platform designed to help you understand the sentiment and mental health trends within Reddit communities. By analyzing posts from various subreddits, we provide insights into how people are feeling, what topics are trending, and how discussions evolve over time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3 items-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/></svg></span>
                  <span className="text-base text-muted-foreground">Discover sentiment patterns in mental health discussions</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
                  <span className="text-base text-muted-foreground">Bookmark and revisit your favorite analyses</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                  <span className="text-base text-muted-foreground">Visualize community trends and topics</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20l9-5-9-5-9 5 9 5z"/></svg></span>
                  <span className="text-base text-muted-foreground">Support mental health awareness with data-driven insights</span>
                </div>
              </div>
              <div className="mt-8">
                <span className="inline-block px-6 py-3 rounded-xl bg-primary text-white font-bold text-lg shadow-lg">Join us in making mental health visible and actionable!</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
