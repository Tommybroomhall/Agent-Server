/**
 * FILE: src/db/models/User.ts
 * ==========================
 * USER MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the User collection.
 * Represents business owners/administrators who use the WhatsApp-Based 
 * AI Business Assistant system.
 * 
 * CONNECTIONS:
 * - Referenced by agent handlers to determine access levels and permissions
 * - Used by webhook handlers to identify legitimate users
 * - Connected to Orders collection (business owner has many orders)
 * - Referenced for billing and subscription management
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores essential user information (name, contact details, business identity)
 * 2. Tracks subscription plan level to determine feature access
 * 3. Used for authentication and authorization
 * 4. Includes timestamps for account creation and updates
 * 
 * DATABASE IMPACT:
 * - Collection name: "users"
 * - Email field is indexed for uniqueness (prevents duplicate accounts)
 * - Will likely be a small collection (one record per business)
 * 
 * SECURITY NOTES:
 * - Does not currently store authentication credentials (should be added for production)
 * - Should implement encryption for sensitive fields in production
 * - Should add permission/role fields for fine-grained access control
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IUser
 * ---------------
 * TypeScript interface for the User document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - name: Full name of the business owner/administrator
 * - email: Primary contact email (used for notifications and account identification)
 * - phone: Contact phone number (may be used for WhatsApp identification)
 * - businessName: Name of the business entity
 * - planLevel: Subscription tier that determines feature access
 * - createdAt: Timestamp for account creation (added by timestamps option)
 * - updatedAt: Timestamp for last update (added by timestamps option)
 */
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  planLevel: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SCHEMA: UserSchema
 * ----------------
 * Mongoose schema definition for the User collection.
 * 
 * VALIDATION RULES:
 * - All fields except planLevel are required
 * - Email must be unique across the collection
 * - planLevel is restricted to enum values
 * - Timestamps are automatically added and managed
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add password field with proper hashing
 * - Should add fields for API keys and access tokens
 * - May need additional fields for billing information
 * - Should implement more robust validation (email format, etc.)
 */
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

// Export the model with typing information
// Collection name in MongoDB will be "users" (lowercase and pluralized)
export default mongoose.model<IUser>('User', UserSchema);
