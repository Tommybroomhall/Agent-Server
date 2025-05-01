/**
 * FILE: src/db/models/Order.ts
 * ===========================
 * ORDER MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Order collection.
 * Represents e-commerce orders processed through the WhatsApp Business Assistant,
 * including all order details, status tracking, and customer information.
 * 
 * CONNECTIONS:
 * - Referenced by customerAgent.ts for retrieving order status
 * - Referenced by staffAgent.ts for updating order status and shipments
 * - Referenced by adminAgent.ts for business metrics and reporting
 * - Connected to User model (customer who placed the order)
 * - Connected to Inventory model (products in the order)
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores complete order information including line items and shipping details
 * 2. Tracks order lifecycle through status changes (pending → processing → shipped → delivered)
 * 3. Maintains payment status separately from fulfillment status
 * 4. Supports order lookup via customer contact information (phone/email)
 * 5. Provides data for reporting and analytics via adminAgent
 * 
 * DATABASE IMPACT:
 * - Collection name: "orders"
 * - orderId field is indexed for uniqueness and quick lookups
 * - Will likely be the largest growing collection in the system
 * - May require consideration for archiving of older orders in production
 * 
 * SECURITY NOTES:
 * - Contains sensitive customer data that must be properly secured
 * - Access to order details should be restricted based on authentication
 * - Consider encryption for sensitive fields in production
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IOrder
 * ---------------
 * TypeScript interface for the Order document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - orderId: Unique business identifier for the order (often externally visible)
 * - customerId: Reference to the User who placed the order
 * - customerName/Email/Phone: Denormalized customer contact information for quick access
 * - status: Current fulfillment state of the order
 * - items: Array of products ordered, with quantities and prices
 * - shippingAddress: Complete delivery location details
 * - totalAmount: Calculated order total (used for financial reporting)
 * - paymentStatus: Tracks whether payment has been received or refunded
 * - trackingNumber: Optional shipment tracking identifier
 * - notes: Optional internal comments about the order
 * - createdAt/updatedAt: Automatic timestamps for order history
 */
export interface IOrder extends Document {
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SCHEMA: OrderSchema
 * -----------------
 * Mongoose schema definition for the Order collection.
 * 
 * VALIDATION RULES:
 * - Required fields ensure complete order information is captured
 * - Enums restrict status values to valid state transitions
 * - References maintain data integrity with User and Inventory collections
 * - Nested schemas define complex object structures (items, addresses)
 * 
 * PRODUCTION CONSIDERATIONS:
 * - May need indexes on customerEmail and customerPhone for lookups
 * - Consider adding order history tracking for all status changes
 * - May need to implement hooks for inventory updates on order state changes
 * - Should add validation for address formats, phone numbers, etc.
 */
const OrderSchema = new Schema<IOrder>(
  {
    // External order identifier (visible to customers)
    // Often displayed in emails, receipts, and customer communications
    orderId: { type: String, required: true, unique: true },
    
    // Customer information with reference to User model
    // Includes denormalized fields for efficiency in lookups
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    
    // Order fulfillment status
    // Tracks progression through the order lifecycle
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    
    // Line items in the order
    // Each item includes reference to product, quantity, and price point
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Inventory' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    
    // Complete shipping address information
    // Required for order fulfillment and delivery
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    
    // Financial information
    totalAmount: { type: Number, required: true },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'refunded'], 
      default: 'pending' 
    },
    
    // Optional fields
    trackingNumber: { type: String },
    notes: { type: String },
  },
  { timestamps: true } // Automatically adds and manages createdAt and updatedAt fields
);

// Export the model with typing information
// Collection name in MongoDB will be "orders" (lowercase and pluralized)
export default mongoose.model<IOrder>('Order', OrderSchema);
