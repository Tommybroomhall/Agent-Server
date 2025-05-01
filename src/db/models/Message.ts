/**
 * FILE: src/db/models/Message.ts
 * ============================
 * MESSAGE MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Message collection.
 * Represents all communication exchanged between users and agents in the system,
 * creating a complete conversation history for audit, context, and analysis.
 * 
 * CONNECTIONS:
 * - Used by all agent handlers to log incoming and outgoing messages
 * - Used by webhookRouter.ts to store incoming WhatsApp messages
 * - Referenced for conversation context and history retrieval
 * - Used for analytics and reporting on agent performance
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores complete history of all messages across the system
 * 2. Tracks message direction (inbound/outbound) for flow analysis
 * 3. Associates messages with specific agent types
 * 4. Preserves media URLs for image/document messages
 * 5. Supports metadata attachment for additional context
 * 
 * DATABASE IMPACT:
 * - Collection name: "messages"
 * - Will grow rapidly in production (high write volume)
 * - Should consider time-based partitioning or TTL indexes
 * - May require optimized queries for conversation retrieval
 * 
 * COMPLIANCE NOTES:
 * - Contains conversation data subject to privacy regulations
 * - May need retention policies based on legal requirements
 * - Should implement appropriate access controls
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IMessage
 * -----------------
 * TypeScript interface for the Message document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - senderId: Identifier of who sent the message (user or system)
 * - receiverId: Identifier of who received the message
 * - content: Actual text content of the message
 * - mediaUrl: Optional link to associated media (images, documents)
 * - direction: Whether message is incoming (inbound) or outgoing (outbound)
 * - agentType: Which agent type handled/generated this message
 * - timestamp: When the message was sent/received
 * - metadata: Flexible field for additional contextual information
 */
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

/**
 * SCHEMA: MessageSchema
 * ------------------
 * Mongoose schema definition for the Message collection.
 * 
 * VALIDATION RULES:
 * - Required fields ensure complete message data is captured
 * - Enum values restrict direction and agent type to valid options
 * - Flexible metadata field allows for extensibility
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add indexes on senderId, timestamp, and agentType for efficient queries
 * - Consider text indexes on content for search functionality
 * - May need compound indexes for conversation reconstruction
 * - Should implement data compression for high-volume storage
 */
const MessageSchema = new Schema<IMessage>(
  {
    // Identification fields for message participants
    senderId: { type: String, required: true },   // Phone number or system identifier
    receiverId: { type: String, required: true }, // Phone number or system identifier
    
    // Core message content
    content: { type: String, required: true },    // The actual message text
    mediaUrl: { type: String },                   // Optional URL to media attachment
    
    // Message classification
    direction: { 
      type: String, 
      enum: ['inbound', 'outbound'],             // Direction of message flow
      required: true 
    },
    agentType: { 
      type: String, 
      enum: ['customer', 'staff', 'admin'],      // Agent context for the message
      required: true 
    },
    
    // Timing and metadata
    timestamp: { type: Date, default: Date.now }, // When message was sent/received
    metadata: { type: Schema.Types.Mixed },       // Flexible additional data
  },
  { timestamps: true }                           // Adds createdAt and updatedAt fields
);

// In production, add these indexes for query performance
// MessageSchema.index({ senderId: 1, timestamp: -1 });  // For conversation history
// MessageSchema.index({ agentType: 1, timestamp: -1 }); // For agent analytics

// Export the model with typing information
// Collection name in MongoDB will be "messages" (lowercase and pluralized)
export default mongoose.model<IMessage>('Message', MessageSchema);
