/**
 * Shared TypeScript types and interfaces
 */

// Agent input interface
export interface AgentInput {
  senderId: string;
  message: string;
  mediaUrl?: string;
  timestamp: string;
  agentType: 'customer' | 'staff' | 'admin';
}

// Agent output interface
export interface AgentOutput {
  reply: string;
  actions?: ('email' | 'whatsapp')[];
}

// Notification interface for inter-agent communication
export interface AgentNotification {
  from: 'customer' | 'staff' | 'admin';
  to: 'customer' | 'staff' | 'admin';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  timestamp: Date;
}

// OCR Result interface
export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// WhatsApp message interface
export interface WhatsAppMessage {
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  timestamp: Date;
}

// Service response interface
export interface ServiceResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}
