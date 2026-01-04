import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { VideoIcon, Users, Calendar, Copy, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import heroImage from "@/assets/hero-video-conference.jpg";

const CreateMeeting = () => {
  const [displayName, setDisplayName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication and load username
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        // Load username from users table
        supabase
          .from("users")
          .select("username, name")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setDisplayName(data.username || data.name);
            }
            setLoading(false);
          });
      }
    });
  }, [navigate]);

  if (loading) {
    return null;
  }

  const generateMeetingCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleCreateMeeting = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a meeting.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const meetingCode = generateMeetingCode();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a meeting.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert({
          code: meetingCode,
          title: meetingTitle || "Quick Meeting",
          host_id: session.user.id,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating meeting:", error);
        toast({
          title: "Failed to create meeting",
          description: "Please try again.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      await supabase.from("meeting_participants").insert({
        meeting_id: meeting.id,
        user_id: session.user.id,
        is_host: true,
      });

      setIsCreating(false);
      navigate(`/meeting/${meetingCode}?host=true&name=${encodeURIComponent(displayName)}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  const handleInstantMeeting = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to start an instant meeting.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const meetingCode = generateMeetingCode();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to start a meeting.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert({
          code: meetingCode,
          title: "Instant Meeting",
          host_id: session.user.id,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating meeting:", error);
        toast({
          title: "Failed to create meeting",
          description: "Please try again.",
          variant: "destructive"
        });
        setIsCreating(false);
        return;
      }

      await supabase.from("meeting_participants").insert({
        meeting_id: meeting.id,
        user_id: session.user.id,
        is_host: true,
      });

      setIsCreating(false);
      navigate(`/meeting/${meetingCode}?host=true&name=${encodeURIComponent(displayName)}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  };

  const copyDemoCode = () => {
    navigator.clipboard.writeText("DEMO1234");
    toast({
      title: "Demo code copied!",
      description: "You can use this code to test joining a meeting.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Hero Content */}
        <div className="text-center lg:text-left text-white space-y-8">
          <Logo size="xl" variant="white" className="justify-center lg:justify-start mb-8" />
          
          <div className="space-y-6">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Video Conferencing
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Connect with Anyone,
              <br />
              <span className="text-white/90 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Anywhere
              </span>
            </h1>
            <p className="text-xl text-white/90 max-w-lg leading-relaxed">
              Experience secure, high-quality video meetings with intelligent features, unlimited participants, and seamless collaboration.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <VideoIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-white/80 font-medium">HD Video Quality</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-white/80 font-medium">Unlimited Participants</p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="text-sm text-white/80 font-medium">No Time Limits</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-white/90 mb-4 font-medium">Try our demo meeting:</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="font-mono text-lg px-4 py-2 bg-white/20 text-white border-white/30">
                DEMO1234
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyDemoCode}
                className="border-white/30 text-white hover:bg-white/20 bg-white/10"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Meeting Creation Form */}
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold">Start Your Meeting</CardTitle>
            <CardDescription className="text-base">
              Create instant meetings or schedule for later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="displayName" className="text-base font-medium">Your Name *</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="meetingTitle" className="text-base font-medium">Meeting Title (Optional)</Label>
              <Input
                id="meetingTitle"
                type="text"
                placeholder="e.g., Team Standup, Client Call"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="bg-background h-12 text-base"
              />
            </div>

            <div className="space-y-4 pt-2">
              <Button 
                onClick={handleCreateMeeting}
                disabled={isCreating}
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200 h-12 text-base font-semibold"
                size="lg"
              >
                {isCreating ? (
                  "Creating Meeting..."
                ) : (
                  <>
                    Create New Meeting
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <Button 
                variant="outline"
                onClick={handleInstantMeeting}
                disabled={isCreating}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Start Instant Meeting
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground font-medium">
                    or
                  </span>
                </div>
              </div>

              <Button 
                variant="secondary"
                onClick={() => navigate('/join')}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Join Existing Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMeeting;