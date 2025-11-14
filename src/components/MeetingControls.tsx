import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff, 
  Phone, 
  Settings,
  UserMinus,
  Volume2,
  VolumeX
} from "lucide-react";

interface MeetingControlsProps {
  isHost?: boolean;
  onEndCall?: () => void;
  onToggleMic?: (enabled: boolean) => void;
  onToggleVideo?: (enabled: boolean) => void;
  onToggleScreenShare?: (enabled: boolean) => void;
  onRemoveParticipant?: (participantId: string) => void;
  participantId?: string;
}

export const MeetingControls = ({
  isHost = false,
  onEndCall,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onRemoveParticipant,
  participantId
}: MeetingControlsProps) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);

  const handleMicToggle = () => {
    const newState = !micEnabled;
    setMicEnabled(newState);
    onToggleMic?.(newState);
  };

  const handleVideoToggle = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    onToggleVideo?.(newState);
  };

  const handleScreenShareToggle = () => {
    const newState = !screenSharing;
    setScreenSharing(newState);
    onToggleScreenShare?.(newState);
  };

  const handleSpeakerToggle = () => {
    setSpeakerEnabled(!speakerEnabled);
  };

  const handleRemoveParticipant = () => {
    if (participantId) {
      onRemoveParticipant?.(participantId);
    }
  };

  return (
    <TooltipProvider>
      <Card className="flex items-center justify-center gap-2 p-4 bg-card/80 backdrop-blur-sm border-border/50">
        {/* Audio Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={micEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={handleMicToggle}
              className="h-12 w-12 rounded-full transition-all duration-200"
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {micEnabled ? "Mute microphone" : "Unmute microphone"}
          </TooltipContent>
        </Tooltip>

        {/* Video Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={videoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={handleVideoToggle}
              className="h-12 w-12 rounded-full transition-all duration-200"
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {videoEnabled ? "Turn off camera" : "Turn on camera"}
          </TooltipContent>
        </Tooltip>

        {/* Screen Share */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={screenSharing ? "default" : "secondary"}
              size="lg"
              onClick={handleScreenShareToggle}
              className="h-12 w-12 rounded-full transition-all duration-200"
            >
              {screenSharing ? <Monitor className="h-5 w-5" /> : <MonitorOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {screenSharing ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>

        {/* Speaker Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="secondary"
              size="lg"
              onClick={handleSpeakerToggle}
              className="h-12 w-12 rounded-full transition-all duration-200"
            >
              {speakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {speakerEnabled ? "Mute speaker" : "Unmute speaker"}
          </TooltipContent>
        </Tooltip>

        {/* Host Controls */}
        {isHost && (
          <>
            <div className="h-8 w-px bg-border mx-2" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={handleRemoveParticipant}
                  className="h-12 w-12 rounded-full transition-all duration-200"
                >
                  <UserMinus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove participant</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-12 w-12 rounded-full transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Meeting settings</TooltipContent>
            </Tooltip>
          </>
        )}

        <div className="h-8 w-px bg-border mx-2" />

        {/* End Call */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive"
              size="lg"
              onClick={onEndCall}
              className="h-12 w-12 rounded-full transition-all duration-200 bg-destructive hover:bg-destructive/90"
            >
              <Phone className="h-5 w-5 rotate-135" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>End call</TooltipContent>
        </Tooltip>
      </Card>
    </TooltipProvider>
  );
};