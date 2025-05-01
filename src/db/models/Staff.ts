/**
 * FILE: src/db/models/Staff.ts
 * ==========================
 * STAFF MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Staff collection.
 * Represents staff members with limited, role-based access to the WhatsApp
 * Business Assistant system who handle day-to-day operations.
 * 
 * CONNECTIONS:
 * - Created and managed by Admin users (referenced via createdBy)
 * - Used by staffAgent.ts for authentication and operation permissions
 * - Used by AuthorizedNumber model for agent access validation
 * - Referenced by operations logs for accountability tracking
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores staff account information with secure password hashing
 * 2. Enforces role-based permissions for operation access control
 * 3. Tracks creation and login activity for security purposes
 * 4. Supports account activation/deactivation
 * 
 * DATABASE IMPACT:
 * - Collection name: "staff"
 * - Moderate-sized collection based on business staffing
 * - Indexed on email and phone for unique enforcement
 * 
 * SECURITY NOTES:
 * - Contains sensitive authentication credentials
 * - Implements role-based access control for system security
 * - Should have audit logging for permission changes
 * - Uses bcrypt for secure password hashing
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * INTERFACE: IStaff
 * ---------------
 * TypeScript interface for the Staff document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - name: Full name of the staff member
 * - email: Unique email address for account identification
 * - phone: WhatsApp phone number for communication
 * - password: Securely hashed password for authentication
 * - role: Primary job function determining default permissions
 * - permissions: Specific system actions this staff member can perform
 * - isActive: Flag to enable/disable account access
 * - createdBy: Reference to Admin who created this account
 * - lastLogin: Timestamp of most recent successful login
 * - createdAt/updatedAt: Automatic timestamps for auditing
 * - comparePassword: Method to securely verify password
 */
export interface IStaff extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'inventory' | 'customer-service' | 'shipping' | 'general';
  permissions: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * SCHEMA: StaffSchema
 * ----------------
 * Mongoose schema definition for the Staff collection.
 * 
 * VALIDATION RULES:
 * - Email and phone must be unique across the collection
 * - All fields except permissions and lastLogin are required
 * - Role must be one of the predefined options
 * - References Admin model via createdBy field
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should expand permissions array with detailed access control
 * - May need to implement more granular role definitions
 * - Should add audit logging for permission changes
 * - Should track failed login attempts for security monitoring
 */
const StaffSchema = new Schema<IStaff>(
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
    role: { 
      type: String, 
      enum: ['inventory', 'customer-service', 'shipping', 'general'],
      default: 'general'
    },
    permissions: [{ 
      type: String 
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: true 
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
 * - Identical approach to Admin model for consistency
 */
StaffSchema.pre('save', async function(next) {
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
StaffSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IStaff>('Staff', StaffSchema);
