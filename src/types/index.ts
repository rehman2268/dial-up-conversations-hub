
export type CallDirection = 'inbound' | 'outbound';

export type CallStatus = 
  | 'idle' 
  | 'connecting' 
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no-answer'
  | 'canceled';

export interface Call {
  id: string;
  phoneNumber: string;
  direction: CallDirection;
  status: CallStatus;
  duration: number;
  timestamp: Date;
  notes?: string;
}

export interface ActiveCallState {
  call?: Call;
  isMuted: boolean;
  isOnHold: boolean;
}
