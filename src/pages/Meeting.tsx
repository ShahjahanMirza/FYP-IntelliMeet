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

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", roomId)
        .eq("status", "active")
        .maybeSingle();

      if (meetingError) {
        console.error("Error fetching meeting:", meetingError);
      }

      if (!meeting && roomId !== "DEMO1234") {
        setError("Meeting not found or has ended");
        setIsLoading(false);
        return;
      }

      if (meeting && !isHost) {
        const { data: existingParticipant } = await supabase
          .from("meeting_participants")
          .select("id")
          .eq("meeting_id", meeting.id)
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!existingParticipant) {
          await supabase.from("meeting_participants").insert({
            meeting_id: meeting.id,
            user_id: session.user.id,
            is_host: false,
          });
        }
      }

      setIsLoading(false);
      toast({
        title: "Joining meeting",
        description: `Welcome ${displayName}! ${isHost ? 'You are the host.' : ''}`,
      });
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An error occurred while joining the meeting");
      setIsLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && roomId && roomId !== "DEMO1234") {
        const { data: meeting } = await supabase
          .from("meetings")
          .select("id")
          .eq("code", roomId)
          .maybeSingle();

        if (meeting) {
          await supabase
            .from("meeting_participants")
            .update({ left_at: new Date().toISOString() })
            .eq("meeting_id", meeting.id)
            .eq("user_id", session.user.id);

          if (isHost) {
            await supabase
              .from("meetings")
              .update({ 
                status: "ended",
                ended_at: new Date().toISOString()
              })
              .eq("id", meeting.id);
          }
        }
      }
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }

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