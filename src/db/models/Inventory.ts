/**
 * FILE: src/db/models/Inventory.ts
 * ==============================
 * INVENTORY MODEL
 * 
 * PURPOSE:
 * Defines the MongoDB schema and interface for the Inventory collection.
 * Represents products available in the system, including their details,
 * pricing, and current stock levels.
 * 
 * CONNECTIONS:
 * - Referenced by Order model for product information
 * - Used by staffAgent.ts for stock management and updates
 * - Used by customerAgent.ts for product information queries
 * - Used by adminAgent.ts for inventory reporting and management
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Stores complete product information including pricing and descriptions
 * 2. Tracks real-time stock levels for inventory management
 * 3. Maintains product status (active/inactive) for availability control
 * 4. Provides product metadata for order processing and customer inquiries
 * 5. Supports product catalog browsing and search
 * 
 * DATABASE IMPACT:
 * - Collection name: "inventories"
 * - Moderate size collection with potentially frequent updates
 * - Critical for preventing overselling and inventory discrepancies
 * - Should implement concurrency controls for stock updates
 * 
 * OPERATIONAL CONSIDERATIONS:
 * - Stock level updates should be atomic operations
 * - May need to implement reservation system for in-progress orders
 * - Should consider implementing stock alerts for low inventory
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * INTERFACE: IInventory
 * -------------------
 * TypeScript interface for the Inventory document type.
 * Extends the Mongoose Document interface to enable strong typing.
 * 
 * FIELDS:
 * - productId: Business identifier for the product
 * - name: Display name of the product
 * - description: Detailed product description
 * - price: Current selling price
 * - stockLevel: Available quantity in inventory
 * - category: Product classification for organization
 * - imageUrl: Optional link to product image
 * - sku: Stock Keeping Unit (unique product identifier)
 * - isActive: Whether the product is currently available
 * - createdAt/updatedAt: Automatic timestamps
 */
export interface IInventory extends Document {
  productId: string;
  name: string;
  description: string;
  price: number;
  stockLevel: number;
  category: string;
  imageUrl?: string;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SCHEMA: InventorySchema
 * ---------------------
 * Mongoose schema definition for the Inventory collection.
 * 
 * VALIDATION RULES:
 * - Required fields ensure complete product information
 * - Unique constraints on productId and SKU prevent duplicates
 * - Default values provide sensible starting points
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Should add indexes on category and isActive for filtering
 * - Consider adding text indexes on name and description for search
 * - May need to implement versioning for price changes
 * - Should track stock level history for analytics
 */
const InventorySchema = new Schema<IInventory>(
  {
    // Primary product identifiers
    productId: { type: String, required: true, unique: true }, // Business/external ID
    sku: { type: String, required: true, unique: true },       // Stock Keeping Unit
    
    // Product details
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    
    // Business data
    price: { type: Number, required: true },
    stockLevel: { type: Number, required: true, default: 0 },
    
    // Status flag
    isActive: { type: Boolean, default: true }, // Controls product visibility/availability
  },
  { timestamps: true } // Adds and manages createdAt and updatedAt fields
);

// In production, add these indexes for query performance
// InventorySchema.index({ category: 1 });  // For category filtering
// InventorySchema.index({ name: 'text', description: 'text' });  // For product search
// InventorySchema.index({ isActive: 1, stockLevel: 1 });  // For available product queries

/**
 * MIDDLEWARE EXAMPLE (for production):
 * ----------------------------------
 * Add stock management hooks and validators
 */
/*
// Prevent negative stock levels
InventorySchema.path('stockLevel').validate(function(value: number) {
  return value >= 0;
}, 'Stock level cannot be negative');

// Log stock level changes
InventorySchema.pre('save', function(next) {
  if (this.isModified('stockLevel')) {
    // Log the stock change to a separate collection
    // This could be implemented for audit purposes
  }
  next();
});
*/

// Export the model with typing information
// Collection name in MongoDB will be "inventories" (lowercase and pluralized)
export default mongoose.model<IInventory>('Inventory', InventorySchema);
