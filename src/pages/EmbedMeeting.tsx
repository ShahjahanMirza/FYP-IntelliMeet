import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MeetingRoom } from "@/components/MeetingRoom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * EmbedMeeting - A minimal meeting page designed to be embedded in an iframe
 * Used by IntelliClass to embed meetings directly within class pages
 * Allows guest access when name is provided via URL params (from IntelliClass)
 */
const EmbedMeeting = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  const isHost = searchParams.get('host') === 'true';
  const nameParam = searchParams.get('name');
  const classId = searchParams.get('classId');

  useEffect(() => {
    const initMeeting = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session but name is provided (from IntelliClass iframe), allow guest mode
      if (!session) {
        if (nameParam && classId) {
          // Guest mode - user is authenticated in IntelliClass, joining via iframe
          setIsGuestMode(true);
          setDisplayName(nameParam);
          await validateMeetingGuest();
          return;
        }
        
        setError("Please sign in to join this meeting");
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Use name from URL param or fetch from database
      if (nameParam) {
        setDisplayName(nameParam);
      } else {
        const { data: userData } = await supabase
          .from("users")
          .select("username, name")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (userData) {
          setDisplayName(userData.username || userData.name);
        }
      }

      await validateMeeting(session.user.id);
    };

    initMeeting();
  }, [roomId, nameParam]);

  const validateMeetingGuest = async () => {
    if (!roomId) {
      setError("Invalid meeting room");
      setIsLoading(false);
      return;
    }

    try {
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", roomId)
        .eq("status", "active")
        .maybeSingle();

      if (meetingError) {
        console.error("Error fetching meeting:", meetingError);
      }

      // Allow DEMO meeting or valid meetings
      if (!meeting && roomId !== "DEMO1234") {
        setError("Meeting not found or has ended");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An error occurred while joining the meeting");
      setIsLoading(false);
    }
  };

  const validateMeeting = async (userId: string) => {
    if (!roomId) {
      setError("Invalid meeting room");
      setIsLoading(false);
      return;
    }

    try {
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("*")
        .eq("code", roomId)
        .eq("status", "active")
        .maybeSingle();

      if (meetingError) {
        console.error("Error fetching meeting:", meetingError);
      }

      // Allow DEMO meeting or valid meetings
      if (!meeting && roomId !== "DEMO1234") {
        setError("Meeting not found or has ended");
        setIsLoading(false);
        return;
      }

      // Add participant if not host
      if (meeting && !isHost) {
        const { data: existingParticipant } = await supabase
          .from("meeting_participants")
          .select("id")
          .eq("meeting_id", meeting.id)
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingParticipant) {
          await supabase.from("meeting_participants").insert({
            meeting_id: meeting.id,
            user_id: userId,
            is_host: false,
          });
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An error occurred while joining the meeting");
      setIsLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    try {
      // Only update database if authenticated (not guest mode)
      if (!isGuestMode) {
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
      }
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }

    // Notify parent window (IntelliClass) that meeting ended
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'MEETING_ENDED', roomId, classId }, '*');
    }
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
          {!isAuthenticated && (
            <Button 
              onClick={() => window.open('/auth', '_blank')}
              className="w-full"
            >
              Sign In
            </Button>
          )}
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

export default EmbedMeeting;
