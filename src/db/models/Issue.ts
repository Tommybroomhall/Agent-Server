/**
 * Issue model
 * Represents open complaints or manual resolutions
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IIssue extends Document {
  issueId: string;
  orderId?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  type: 'delivery' | 'product' | 'payment' | 'other';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    issueId: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['delivery', 'product', 'payment', 'other'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['open', 'in-progress', 'resolved', 'closed'], 
      default: 'open' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'], 
      default: 'medium' 
    },
    description: { type: String, required: true },
    assignedTo: { type: String },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IIssue>('Issue', IssueSchema);
