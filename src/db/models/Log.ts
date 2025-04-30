/**
 * Log model
 * Represents agent actions, command history, audit trails
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  agentType: 'customer' | 'staff' | 'admin';
  action: string;
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  details: Record<string, any>;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>(
  {
    agentType: { 
      type: String, 
      enum: ['customer', 'staff', 'admin'], 
      required: true 
    },
    action: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    details: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ILog>('Log', LogSchema);
