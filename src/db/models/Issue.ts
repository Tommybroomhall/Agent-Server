/**
 * FILE: src/db/models/Issue.ts
 * ==========================
 * ISSUE MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Issue collection.
 * Represents customer problems, complaints, and support tickets that
 * require tracking and resolution by the business staff.
 * 
 * CONNECTIONS:
 * - Created by customerAgent.ts when customers report problems
 * - Referenced by staffAgent.ts for issue management and resolution
 * - Referenced by adminAgent.ts for support metrics and reporting
 * - Connected to User model (customer who reported the issue)
 * - Optionally connected to Order model (if issue relates to an order)
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Tracks customer-reported issues from creation to resolution
 * 2. Categorizes issues by type and priority for appropriate handling
 * 3. Maintains the complete history of the issue lifecycle
 * 4. Supports issue assignment and ownership
 * 5. Records resolution details and outcome
 * 6. Provides data for customer service quality metrics
 * 
 * DATABASE IMPACT:
 * - Collection name: "issues"
 * - Grows based on customer service volume
 * - Critical for customer satisfaction monitoring
 * - May need periodic archiving of resolved issues
 * 
 * BUSINESS IMPORTANCE:
 * - Central to customer satisfaction and retention
 * - Key to identifying recurring problems
 * - Source of truth for support team performance metrics
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IIssue
 * ---------------
 * TypeScript interface for the Issue document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - issueId: Unique business identifier for the issue (customer-facing)
 * - orderId: Optional reference to related order (if applicable)
 * - customerId: Reference to the customer who reported the issue
 * - type: Category of the issue for classification
 * - status: Current state in the resolution workflow
 * - priority: Urgency level for handling
 * - description: Detailed explanation of the problem
 * - assignedTo: Staff member responsible for resolution
 * - resolution: Details of how the issue was resolved
 * - createdAt/updatedAt: Automatic timestamps
 * - resolvedAt: When the issue was marked as resolved
 */
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

/**
 * SCHEMA: IssueSchema
 * -----------------
 * Mongoose schema definition for the Issue collection.
 * 
 * VALIDATION RULES:
 * - Required fields ensure complete issue information
 * - Enums restrict type, status, and priority to valid values
 * - References maintain data integrity with User and Order collections
 * 
 * STATUS WORKFLOW:
 * - open: Issue reported but not yet being worked on
 * - in-progress: Being actively addressed by staff
 * - resolved: Solution implemented, awaiting confirmation
 * - closed: Issue verified as resolved and complete
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add indexes on status, type, and priority for filtering
 * - May need to implement SLA (Service Level Agreement) tracking
 * - Should consider implementing notification system for status changes
 */
const IssueSchema = new Schema<IIssue>(
  {
    // Identification
    issueId: { type: String, required: true, unique: true }, // Customer-facing ID (e.g., "ISSUE-12345")
    
    // Relationships
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },    // Optional link to related order
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Customer who reported issue
    
    // Classification
    type: { 
      type: String, 
      enum: ['delivery', 'product', 'payment', 'other'], 
      required: true 
    },
    
    // Workflow state
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
    
    // Content
    description: { type: String, required: true },  // Customer's explanation of the problem
    
    // Resolution tracking
    assignedTo: { type: String },                   // Staff member handling the issue
    resolution: { type: String },                   // Description of the solution applied
    resolvedAt: { type: Date },                     // When the issue was marked as resolved
  },
  { timestamps: true }                              // Adds createdAt and updatedAt fields
);

// In production, add these indexes for query performance
// IssueSchema.index({ status: 1, priority: -1 });  // For staff issue dashboard
// IssueSchema.index({ customerId: 1, createdAt: -1 }); // For customer issue history
// IssueSchema.index({ assignedTo: 1, status: 1 }); // For staff workload management

/**
 * MIDDLEWARE EXAMPLE (for production):
 * ----------------------------------
 * Add status transition validation and notification triggers
 */
/*
// Validate status transitions
IssueSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    // Could implement state machine validation here
  }
  next();
});

// Trigger notifications on status change
IssueSchema.post('save', function(doc) {
  if (this.isModified('status')) {
    // Could implement notification system here
    // e.g., notify customer when issue is resolved
    // or alert staff when new high-priority issue is created
  }
});
*/

// Export the model with typing information
// Collection name in MongoDB will be "issues" (lowercase and pluralized)
export default mongoose.model<IIssue>('Issue', IssueSchema);
