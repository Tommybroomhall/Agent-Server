/**
 * FILE: src/db/models/Admin.ts
 * ==========================
 * ADMIN MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Admin collection.
 * Represents system administrators who have full access to the WhatsApp Business
 * Assistant system and can manage staff accounts, business settings, and view analytics.
 * 
 * CONNECTIONS:
 * - Referenced by Staff model via the createdBy field
 * - Used by adminAgent.ts for authentication and admin operations
 * - Used by AuthorizedNumber model for agent access validation
 * - Used by access control middleware for permission checks
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores admin account information with secure password hashing
 * 2. Provides authentication methods for admin login
 * 3. Tracks last login time for security auditing
 * 4. Supports account activation/deactivation
 * 
 * DATABASE IMPACT:
 * - Collection name: "admins"
 * - Typically small collection with limited entries
 * - Indexes on email and phone for unique enforcement
 * 
 * SECURITY NOTES:
 * - Contains highly sensitive authentication credentials
 * - Implements bcrypt password hashing for security
 * - Should add additional fields for multi-factor authentication in production
 * - Critical for maintaining secure system access
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * INTERFACE: IAdmin
 * ---------------
 * TypeScript interface for the Admin document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - name: Full name of the administrator
 * - email: Unique email address for account identification
 * - phone: WhatsApp phone number for communication
 * - password: Securely hashed password for authentication
 * - isActive: Flag to enable/disable account access
 * - lastLogin: Timestamp of most recent successful login
 * - createdAt/updatedAt: Automatic timestamps for auditing
 * - comparePassword: Method to securely verify password
 */
export interface IAdmin extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * SCHEMA: AdminSchema
 * ----------------
 * Mongoose schema definition for the Admin collection.
 * 
 * VALIDATION RULES:
 * - Email and phone must be unique across the collection
 * - All fields except lastLogin are required
 * - Email is normalized to lowercase and trimmed
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add fields for role-based permissions
 * - Should implement password complexity validation
 * - Should add audit logging for sensitive operations
 * - Consider adding password expiration mechanism
 */
const AdminSchema = new Schema<IAdmin>(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    password: { 
      type: String, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastLogin: { 
      type: Date 
    }
  },
  { timestamps: true }
);

/**
 * MIDDLEWARE: Password Hashing
 * --------------------------
 * Pre-save hook that automatically hashes passwords before saving to database.
 * Only hashes the password if it has been modified or is new.
 * 
 * SECURITY:
 * - Uses bcrypt with salt for secure one-way hashing
 * - Prevents plain-text password storage in database
 */
AdminSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * METHOD: comparePassword
 * ---------------------
 * Instance method to securely check if a provided password matches the stored hash.
 * Used during authentication to validate login credentials.
 * 
 * @param candidatePassword - The plain-text password to verify
 * @returns Promise resolving to boolean indicating match status
 */
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdmin>('Admin', AdminSchema);
