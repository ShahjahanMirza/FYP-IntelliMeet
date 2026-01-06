import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { VideoIcon, Users, Shield, Zap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-video-conference.jpg";

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex items-center justify-between">
        <Logo size="lg" variant="gradient" />
        <Button 
          onClick={handleSignIn}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Premium video meetings.
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Now free for everyone.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              We re-engineered the service we built for secure business meetings, IntelliMeet, to make it free and available for all.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                onClick={handleSignIn}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate("/join")}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Join a Meeting
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <VideoIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">HD Video Quality</h3>
              <p className="text-muted-foreground">
                Crystal clear video and audio for seamless communication
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Unlimited Participants</h3>
              <p className="text-muted-foreground">
                Connect with as many people as you need, no limits
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your meetings are encrypted and protected
              </p>
            </div>
          </div>

          {/* Additional Feature */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Features Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IntelliMeet. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
