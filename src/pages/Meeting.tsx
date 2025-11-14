import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MeetingRoom } from "@/components/MeetingRoom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Meeting = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  
  const isHost = searchParams.get('host') === 'true';

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
            validateMeeting();
          });
      }
    });
  }, [navigate]);

  const validateMeeting = async () => {
    if (!roomId) {
      setError("Invalid meeting room");
      setIsLoading(false);
      return;
    }

    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, accept DEMO1234 or any stored meeting
    const storedMeeting = localStorage.getItem(`meeting_${roomId}`);
    
    if (roomId === "DEMO1234" || storedMeeting) {
      setIsLoading(false);
      toast({
        title: "Joining meeting",
        description: `Welcome ${displayName}! ${isHost ? 'You are the host.' : ''}`,
      });
    } else {
      setError("Meeting not found or has ended");
      setIsLoading(false);
    }
  };

  const handleLeaveMeeting = () => {
    toast({
      title: "Left meeting",
      description: "You have successfully left the meeting.",
    });
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Joining Meeting</h2>
            <p className="text-muted-foreground">
              Connecting to room {roomId}...
            </p>
            <p className="text-sm text-muted-foreground">
              Welcome, {displayName}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Unable to Join</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              Create New Meeting
            </Button>
            <Button variant="outline" onClick={() => navigate('/join')} className="w-full">
              Try Different Code
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <MeetingRoom
      roomName={roomId!}
      displayName={displayName}
      isHost={isHost}
      onLeaveMeeting={handleLeaveMeeting}
    />
  );
};

export default Meeting;