/**
 * FILE: src/db/models/AuthorizedNumber.ts
 * =====================================
 * AUTHORIZED NUMBER MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the AuthorizedNumber collection.
 * Manages which phone numbers can access different agent types in the system and
 * links them to their corresponding user accounts (admin, staff, or customer).
 * 
 * CONNECTIONS:
 * - Used by authService to verify agent access permissions
 * - Referenced by agentRouter.ts for authorization middleware
 * - Links to User, Staff, and Admin models through dynamic references
 * - Central to the system's access control architecture
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores phone numbers with their authorized agent access levels
 * 2. Provides dynamic references to the appropriate user model based on type
 * 3. Controls which phone numbers can access staff and admin agents
 * 4. Supports activation/deactivation of access without deleting records
 * 
 * DATABASE IMPACT:
 * - Collection name: "authorizednumbers"
 * - Will contain all registered phone numbers with agent access
 * - Compound index on phone and userType for quick lookups
 * - Critical for system security and access control
 * 
 * SECURITY NOTES:
 * - Core component of the system's authorization mechanism
 * - Should implement validation for phone number formats
 * - Key to preventing unauthorized access to sensitive agent functions
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IAuthorizedNumber
 * --------------------------
 * TypeScript interface for the AuthorizedNumber document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - phone: The phone number that identifies the user via WhatsApp
 * - userType: The type of user this number belongs to (determines agent access)
 * - userId: Optional reference to the specific user record (if linked)
 * - isActive: Whether this number's authorization is currently active
 * - createdAt/updatedAt: Automatic timestamps for auditing
 */
export interface IAuthorizedNumber extends Document {
  phone: string;
  userType: 'admin' | 'staff' | 'customer';
  userId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SCHEMA: AuthorizedNumberSchema
 * ----------------------------
 * Mongoose schema definition for the AuthorizedNumber collection.
 * 
 * VALIDATION RULES:
 * - Phone number must be unique across the collection
 * - userType must be one of the predefined roles
 * - userId is optional but must be a valid ObjectId if provided
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add more robust phone number validation
 * - May need to support multiple user types per phone in the future
 * - Should implement hooks for logging authorization changes
 */
const AuthorizedNumberSchema = new Schema<IAuthorizedNumber>(
  {
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    userType: { 
      type: String, 
      enum: ['admin', 'staff', 'customer'],
      required: true
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      refPath: 'userType' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Create compound index for phone and userType
AuthorizedNumberSchema.index({ phone: 1, userType: 1 }, { unique: true });

export default mongoose.model<IAuthorizedNumber>('AuthorizedNumber', AuthorizedNumberSchema);
