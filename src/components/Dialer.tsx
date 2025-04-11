
import React, { useState } from 'react';
import { Phone, X, Plus, Asterisk, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber, makeCall } from '@/lib/twilio';
import { useToast } from '@/components/ui/use-toast';

interface DialerProps {
  onCallInitiated: (phoneNumber: string) => void;
}

const Dialer = ({ onCallInitiated }: DialerProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const handleDigitClick = (digit: string) => {
    setPhoneNumber(prev => formatPhoneNumber(prev + digit));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleCall = async () => {
    if (phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    try {
      await makeCall(phoneNumber);
      toast({
        title: "Call Initiated",
        description: `Calling ${phoneNumber}...`
      });
      onCallInitiated(phoneNumber);
    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Could not connect the call. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeypadInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    setPhoneNumber(formatPhoneNumber(input));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Input
            value={phoneNumber}
            onChange={handleKeypadInput}
            className="text-xl text-center"
            placeholder="Enter phone number"
          />
          
          <div className="grid grid-cols-3 gap-4 my-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigitClick(digit.toString())}
                className="dialer-button bg-secondary"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => handleDigitClick('*')}
              className="dialer-button bg-secondary"
            >
              <Asterisk className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDigitClick('0')}
              className="dialer-button bg-secondary"
            >
              0
              <Plus className="h-3 w-3 ml-1" />
            </button>
            <button
              onClick={() => handleDigitClick('#')}
              className="dialer-button bg-secondary"
            >
              <Hash className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-14 w-14"
              onClick={handleClear}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600"
              onClick={handleCall}
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dialer;
