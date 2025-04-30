/**
 * User model
 * Represents business identity, contact info, plan level
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  planLevel: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    planLevel: { 
      type: String, 
      enum: ['free', 'basic', 'premium'], 
      default: 'free' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
