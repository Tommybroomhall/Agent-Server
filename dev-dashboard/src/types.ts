export type AgentType = 'customer' | 'staff' | 'admin';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  mediaUrl?: string;
}

export interface AgentInput {
  senderId: string;
  message: string;
  mediaUrl?: string;
  timestamp: string;
  agentType: AgentType;
}

export interface AgentOutput {
  reply: string;
  actions?: ('email' | 'whatsapp')[];
}
