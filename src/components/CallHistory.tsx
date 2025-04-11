
import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock } from 'lucide-react';
import { getCallHistory } from '@/lib/twilio';
import { Call } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface CallHistoryProps {
  onCallBack: (phoneNumber: string) => void;
}

const CallHistory = ({ onCallBack }: CallHistoryProps) => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const callHistory = await getCallHistory();
        setCalls(callHistory);
      } catch (error) {
        console.error('Failed to fetch call history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalls();
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: Call) => {
    if (call.direction === 'inbound') {
      return call.status === 'completed' ? 
        <PhoneIncoming className="h-4 w-4 text-green-500" /> : 
        <PhoneMissed className="h-4 w-4 text-red-500" />;
    } else {
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredCalls = (direction?: 'inbound' | 'outbound') => {
    if (!direction) return calls;
    return calls.filter(call => call.direction === direction);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <PhoneCall className="h-5 w-5 mr-2" />
          Call History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="outbound">Outbound</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <span>Loading call history...</span>
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <CallList calls={filteredCalls()} onCallBack={onCallBack} formatTimestamp={formatTimestamp} formatDuration={formatDuration} getCallIcon={getCallIcon} />
              </TabsContent>
              <TabsContent value="inbound">
                <CallList calls={filteredCalls('inbound')} onCallBack={onCallBack} formatTimestamp={formatTimestamp} formatDuration={formatDuration} getCallIcon={getCallIcon} />
              </TabsContent>
              <TabsContent value="outbound">
                <CallList calls={filteredCalls('outbound')} onCallBack={onCallBack} formatTimestamp={formatTimestamp} formatDuration={formatDuration} getCallIcon={getCallIcon} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface CallListProps {
  calls: Call[];
  onCallBack: (phoneNumber: string) => void;
  formatTimestamp: (date: Date) => string;
  formatDuration: (seconds: number) => string;
  getCallIcon: (call: Call) => JSX.Element;
}

const CallList = ({ calls, onCallBack, formatTimestamp, formatDuration, getCallIcon }: CallListProps) => {
  if (calls.length === 0) {
    return <div className="text-center py-6 text-muted-foreground">No calls found</div>;
  }

  return (
    <ScrollArea className="h-[280px]">
      <div className="space-y-1">
        {calls.map((call) => (
          <div key={call.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
            <div className="flex items-center">
              {getCallIcon(call)}
              <div className="ml-3">
                <p className="font-medium">{call.phoneNumber}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTimestamp(call.timestamp)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDuration(call.duration)}</span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={() => onCallBack(call.phoneNumber)}
            >
              <PhoneCall className="h-4 w-4" />
              <span className="sr-only">Call back</span>
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CallHistory;
