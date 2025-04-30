/**
 * Inventory model
 * Represents stock levels, product metadata
 */

import mongoose, { Document, Schema } from 'mongoose';

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

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stockLevel: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String },
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>('Inventory', InventorySchema);
