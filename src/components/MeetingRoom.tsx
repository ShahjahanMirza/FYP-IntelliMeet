import { useEffect, useRef, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { MeetingControls } from "./MeetingControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// JaaS (Jitsi as a Service) Configuration
const JAAS_APP_ID = "vpaas-magic-cookie-caa4035db06e460dbe6aaebdb5d45cee";

interface MeetingRoomProps {
  roomName: string;
  displayName: string;
  isHost?: boolean;
  onLeaveMeeting?: () => void;
  jwt?: string; // Optional JWT token for premium features (recording, live streaming, etc.)
}

export const MeetingRoom = ({ 
  roomName, 
  displayName, 
  isHost = false, 
  onLeaveMeeting,
  jwt
}: MeetingRoomProps) => {
  const jitsiRef = useRef<any>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [isJitsiLoading, setIsJitsiLoading] = useState(true);
  const [jitsiError, setJitsiError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyMeetingCode = () => {
    navigator.clipboard.writeText(roomName);
    toast({
      title: "Meeting code copied!",
      description: "Share this code with others to join the meeting.",
    });
  };

  const jitsiConfig = {
    roomName: roomName,
    displayName: displayName,
    subject: `Meeting Room: ${roomName}`,
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      toolbarButtons: [
        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording', 
        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 
        'shortcuts', 'tileview', 'videobackgroundblur', 'download', 'help'
      ],
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: "",
      SHOW_POWERED_BY: false,
      DISPLAY_WELCOME_PAGE_CONTENT: false,
      DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
      APP_NAME: "MeetSpace",
      NATIVE_APP_NAME: "MeetSpace",
      PROVIDER_NAME: "MeetSpace",
      TOOLBAR_ALWAYS_VISIBLE: true,
    },
    userInfo: {
      displayName: displayName,
      email: `${displayName.replace(/\s+/g, '').toLowerCase()}@meetspace.local`,
    }
  };

  const handleJitsiEvents = {
    onReadyToClose: () => {
      onLeaveMeeting?.();
    },
    onApiReady: () => {
      console.log('Jitsi API is ready');
      setIsJitsiLoading(false);
      setJitsiError(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Meeting Header */}
      <Card className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">Meeting Room</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(meetingDuration)}</span>
            </div>
          </div>
          
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Meeting Code:</span>
            <Badge variant="outline" className="font-mono">
              {roomName}
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyMeetingCode}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>

          {isHost && (
            <Badge className="bg-gradient-primary">
              Host
            </Badge>
          )}
        </div>
      </Card>

      {/* Jitsi Meeting Container */}
      <div className="flex-1 relative w-full h-full bg-background">
        {isJitsiLoading && (
          <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
            <Card className="p-8 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Connecting to meeting...</h3>
                <p className="text-muted-foreground">Please wait while we set up your video conference</p>
              </div>
            </Card>
          </div>
        )}
        
        {jitsiError && (
          <div className="absolute inset-0 bg-background flex items-center justify-center z-10">
            <Card className="p-8 text-center space-y-4 max-w-md">
              <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Connection Error</h3>
                <p className="text-muted-foreground">{jitsiError}</p>
              </div>
              <Button onClick={() => {
                setJitsiError(null);
                setIsJitsiLoading(true);
              }}>
                Retry
              </Button>
            </Card>
          </div>
        )}
        
        <div 
          className="w-full h-full"
          style={{ 
            backgroundColor: 'hsl(var(--background))',
            minHeight: '600px'
          }}
        >
          <JitsiMeeting
            domain="8x8.vc"
            roomName={`${JAAS_APP_ID}/${roomName}`}
            configOverwrite={jitsiConfig.configOverwrite}
            interfaceConfigOverwrite={jitsiConfig.interfaceConfigOverwrite}
            userInfo={jitsiConfig.userInfo}
            jwt={jwt}
            onReadyToClose={handleJitsiEvents.onReadyToClose}
            onApiReady={handleJitsiEvents.onApiReady}
            getIFrameRef={(iframeRef) => {
              jitsiRef.current = iframeRef;
              if (iframeRef) {
                // Apply styling to iframe
                iframeRef.style.width = '100%';
                iframeRef.style.height = '100%';
                iframeRef.style.border = 'none';
                iframeRef.style.backgroundColor = 'hsl(var(--background))';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};