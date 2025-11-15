import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

const JoinMeeting = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        // Load username from profile
        supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setDisplayName(data.username);
            }
            setLoading(false);
          });
      }
    });
  }, [navigate]);

  if (loading) {
    return null;
  }

  const handleJoinMeeting = async () => {
    if (!meetingCode.trim()) {
      toast({
        title: "Meeting code required",
        description: "Please enter a valid meeting code.",
        variant: "destructive"
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to join the meeting.",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to join a meeting.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { data: meeting, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", meetingCode.toUpperCase())
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.error("Error checking meeting:", error);
        toast({
          title: "Error",
          description: "Failed to verify meeting code.",
          variant: "destructive"
        });
        setIsJoining(false);
        return;
      }

      if (!meeting && meetingCode.toUpperCase() !== "DEMO1234") {
        setIsJoining(false);
        toast({
          title: "Meeting not found",
          description: "Please check the meeting code and try again.",
          variant: "destructive"
        });
        return;
      }

      if (meeting) {
        await supabase.from("meeting_participants").insert({
          meeting_id: meeting.id,
          user_id: session.user.id,
          is_host: false,
        });
      }

      setIsJoining(false);
      navigate(`/meeting/${meetingCode.toUpperCase()}?host=false&name=${encodeURIComponent(displayName)}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };

  const formatMeetingCode = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleaned.slice(0, 8);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMeetingCode(e.target.value);
    setMeetingCode(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Logo size="lg" variant="white" />
      </div>
      
      <div className="w-full max-w-md">
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Users className="h-3 w-3 mr-1" />
                Join Meeting
              </Badge>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl">Join a Meeting</CardTitle>
              <CardDescription>
                Enter the meeting code provided by the host
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meetingCode">Meeting Code *</Label>
              <Input
                id="meetingCode"
                type="text"
                placeholder="Enter 8-digit code"
                value={meetingCode}
                onChange={handleCodeChange}
                className="bg-background font-mono text-center text-lg tracking-wider"
                maxLength={8}
              />
              <p className="text-xs text-muted-foreground text-center">
                Code format: ABC12345 (8 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name *</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Secure & Private</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your meeting is end-to-end encrypted and secure. Only participants with the meeting code can join.
              </p>
            </div>

            <Button 
              onClick={handleJoinMeeting}
              disabled={isJoining || !meetingCode || !displayName}
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-200"
              size="lg"
            >
              {isJoining ? (
                "Joining Meeting..."
              ) : (
                <>
                  Join Meeting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have a meeting code?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => navigate('/')}
                >
                  Create a new meeting
                </Button>
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="text-xs text-center text-muted-foreground">
                <strong>Demo:</strong> Use code <code className="bg-primary/10 px-1 rounded">DEMO1234</code> to test the platform
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinMeeting;