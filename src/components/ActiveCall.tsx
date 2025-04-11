
import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Pause, Play, PhoneOff, Clock } from 'lucide-react';
import { Call } from '@/types';
import { endCall, toggleMute, toggleHold } from '@/lib/twilio';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ActiveCallProps {
  call: Call;
  onCallEnded: () => void;
}

const ActiveCall = ({ call, onCallEnded }: ActiveCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [callStatus, setCallStatus] = useState(call.status);
  const { toast } = useToast();

  // Update call status when the call prop changes
  useEffect(() => {
    setCallStatus(call.status);
  }, [call]);

  // Simulate call progress
  useEffect(() => {
    if (callStatus === 'connecting') {
      const timer = setTimeout(() => setCallStatus('ringing'), 2000);
      return () => clearTimeout(timer);
    }
    if (callStatus === 'ringing') {
      const timer = setTimeout(() => setCallStatus('in-progress'), 3000);
      return () => clearTimeout(timer);
    }
  }, [callStatus]);

  // Timer for call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callStatus === 'in-progress') {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const handleEndCall = async () => {
    try {
      await endCall(call.id);
      toast({
        title: "Call Ended",
        description: `Call with ${call.phoneNumber} has ended.`
      });
      onCallEnded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute(call.id, !isMuted);
      setIsMuted(!isMuted);
      toast({
        title: isMuted ? "Unmuted" : "Muted",
        description: isMuted ? "Call unmuted" : "Call muted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle mute. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleHold = async () => {
    try {
      await toggleHold(call.id, !isOnHold);
      setIsOnHold(!isOnHold);
      toast({
        title: isOnHold ? "Call Resumed" : "Call On Hold",
        description: isOnHold ? "Call has been resumed" : "Call has been placed on hold"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle hold. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusDisplay = () => {
    switch (callStatus) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'in-progress':
        return isOnHold ? 'On Hold' : 'In Progress';
      default:
        return callStatus.charAt(0).toUpperCase() + callStatus.slice(1);
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connecting':
      case 'ringing':
        return 'text-yellow-500';
      case 'in-progress':
        return isOnHold ? 'text-yellow-500' : 'text-green-500';
      case 'completed':
        return 'text-blue-500';
      case 'failed':
      case 'busy':
      case 'no-answer':
      case 'canceled':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="w-full border-t-4 border-primary">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">{call.phoneNumber}</h3>
            <div className="flex items-center justify-center mt-2">
              <Phone className={`h-4 w-4 mr-2 ${getStatusColor()}`} />
              <span className={`text-sm ${getStatusColor()}`}>{getStatusDisplay()}</span>
            </div>
            {callStatus === 'in-progress' && (
              <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatElapsedTime()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              size="lg"
              className={`call-button ${isMuted ? 'bg-rose-100 text-rose-500' : ''}`}
              onClick={handleToggleMute}
              disabled={callStatus !== 'in-progress'}
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={`call-button ${isOnHold ? 'bg-amber-100 text-amber-500' : ''}`}
              onClick={handleToggleHold}
              disabled={callStatus !== 'in-progress'}
            >
              {isOnHold ? (
                <Play className="h-6 w-6" />
              ) : (
                <Pause className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              className="call-button"
              onClick={handleEndCall}
              disabled={callStatus !== 'in-progress' && callStatus !== 'ringing' && callStatus !== 'connecting'}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCall;
