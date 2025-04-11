
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react';
import Header from '@/components/Header';
import Dialer from '@/components/Dialer';
import CallHistory from '@/components/CallHistory';
import ActiveCall from '@/components/ActiveCall';
import { Call } from '@/types';
import { makeCall } from '@/lib/twilio';

const Index = () => {
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  const handleCallInitiated = async (phoneNumber: string) => {
    try {
      const newCall = await makeCall(phoneNumber);
      setActiveCall(newCall);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const handleCallEnded = () => {
    setActiveCall(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Left sidebar with call history */}
          <div className="md:col-span-2">
            <CallHistory onCallBack={handleCallInitiated} />
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-3 space-y-6">
            {activeCall ? (
              <ActiveCall call={activeCall} onCallEnded={handleCallEnded} />
            ) : (
              <Tabs defaultValue="outbound" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="outbound" className="flex items-center">
                    <PhoneOutgoing className="h-4 w-4 mr-2" />
                    Outbound
                  </TabsTrigger>
                  <TabsTrigger value="inbound" className="flex items-center">
                    <PhoneIncoming className="h-4 w-4 mr-2" />
                    Inbound
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="outbound">
                  <Dialer onCallInitiated={handleCallInitiated} />
                </TabsContent>
                
                <TabsContent value="inbound">
                  <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                    <h3 className="text-lg font-medium mb-2">Inbound Calls</h3>
                    <p className="text-muted-foreground">
                      Your call center is ready to receive incoming calls.
                    </p>
                    <p className="text-sm mt-4">
                      When someone calls your Twilio number, their call will appear here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
