import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
const Header = () => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
      }
    };
    fetchUser();
  }, []);
  return (
    <header className="sticky top-0 z-50 w-full py-4 px-6 bg-background/80 backdrop-blur-md border-b border-border/20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/pulse.svg" alt="Logo" className="w-8 h-8" />
          <span className="text-2xl font-bold text-primary">MindPulse</span>
        </Link>
        <span className="hidden md:inline text-xs px-2 py-1 rounded bg-primary/10 text-primary">Mental Health AI</span>
      </div>
  <nav className="flex gap-8 items-center">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <Link to="/analyze" className="hover:text-primary transition">Analyze</Link>
  <Link to="/about" className="hover:text-primary transition">About</Link>
  <Link to="/contacted-users" className="hover:text-primary transition">Contacted Users</Link>
        <ProfileAvatar />
        <Button variant="outline" onClick={handleSignOut} size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </nav>
    </header>
  );
};

export default Header;

// ProfileAvatar component for header
function ProfileAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
      }
    };
    fetchUser();
  }, []);
  return (
    <Link to="/user">
      <Avatar className="w-8 h-8 border border-muted">
        <AvatarImage src={avatarUrl || "/pulse.svg"} alt="Profile" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </Link>
  );
}
