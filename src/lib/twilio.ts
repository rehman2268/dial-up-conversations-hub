
import { Call, CallStatus, CallDirection } from '../types';

// Mock Twilio functionality for now
// In a real implementation, you would use the Twilio SDK and connect to your backend

// Generate a mock call ID
const generateCallId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Initialize mock call history
const mockCallHistory: Call[] = [
  {
    id: generateCallId(),
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    status: "completed",
    duration: 143,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
  },
  {
    id: generateCallId(),
    phoneNumber: "+1 (555) 987-6543",
    direction: "outbound",
    status: "completed",
    duration: 67,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: generateCallId(),
    phoneNumber: "+1 (555) 234-5678",
    direction: "inbound",
    status: "missed",
    duration: 0,
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
  }
];

// Mock functions for call handling
export const getCallHistory = (): Promise<Call[]> => {
  return Promise.resolve([...mockCallHistory]);
};

export const makeCall = async (phoneNumber: string): Promise<Call> => {
  // In a real implementation, this would use the Twilio API to make a call
  console.log(`Making call to ${phoneNumber}`);
  
  const newCall: Call = {
    id: generateCallId(),
    phoneNumber,
    direction: "outbound",
    status: "connecting",
    duration: 0,
    timestamp: new Date(),
  };
  
  mockCallHistory.unshift(newCall);
  
  // Simulate call progression
  setTimeout(() => {
    newCall.status = "ringing";
    // In a real application, you would update your UI via a state management system
  }, 1000);
  
  return newCall;
};

export const endCall = async (callId: string): Promise<void> => {
  // In a real implementation, this would use the Twilio API to end a call
  console.log(`Ending call ${callId}`);
  
  const call = mockCallHistory.find(c => c.id === callId);
  if (call) {
    call.status = "completed";
  }
};

export const toggleMute = async (callId: string, mute: boolean): Promise<void> => {
  // In a real implementation, this would use the Twilio API to mute/unmute
  console.log(`${mute ? 'Muting' : 'Unmuting'} call ${callId}`);
};

export const toggleHold = async (callId: string, hold: boolean): Promise<void> => {
  // In a real implementation, this would use the Twilio API to place on/off hold
  console.log(`${hold ? 'Placing on hold' : 'Resuming'} call ${callId}`);
};

export const formatPhoneNumber = (input: string): string => {
  // Format phone number to (XXX) XXX-XXXX
  const cleaned = input.replace(/\D/g, '');
  let formatted = cleaned;
  
  if (cleaned.length > 0) {
    if (cleaned.length <= 3) {
      formatted = `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  }
  
  return formatted;
};
