/**
 * Message model
 * Represents structured chat logs with type and direction
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  direction: 'inbound' | 'outbound';
  agentType: 'customer' | 'staff' | 'admin';
  timestamp: Date;
  metadata?: Record<string, any>;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    direction: { 
      type: String, 
      enum: ['inbound', 'outbound'], 
      required: true 
    },
    agentType: { 
      type: String, 
      enum: ['customer', 'staff', 'admin'], 
      required: true 
    },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
