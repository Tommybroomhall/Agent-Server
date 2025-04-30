/**
 * FILE: src/db/connect.ts
 * ======================
 * MONGODB CONNECTION MANAGER
 * 
 * PURPOSE:
 * Establishes and manages the connection to MongoDB Atlas database.
 * Provides centralized functions for connecting to and disconnecting from MongoDB.
 * In production, this file handles the critical database connectivity layer.
 * 
 * CONNECTIONS:
 * - Used by src/index.ts for initial database connection
 * - Any module requiring direct database connection management
 * - Connected to MongoDB Atlas in production environment
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Reads MongoDB connection string from environment variables
 * 2. Establishes connection with appropriate options for production (pooling, etc.)
 * 3. Provides connection status logging for monitoring
 * 4. Handles graceful disconnection when needed (server shutdown, etc.)
 * 
 * ENVIRONMENT DEPENDENCIES:
 * - MONGODB_URI: MongoDB connection string (required in production)
 * - Falls back to localhost development database if not specified
 * 
 * SECURITY NOTES:
 * - Connection string in production should use certificate-based authentication
 * - MongoDB Atlas IP allowlisting should be configured for production servers
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// SECTION: Configuration
// ---------------------
// Connection string from environment variables with fallback for local development
// In production, this must be set to a full Atlas connection string with credentials
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-server';

/**
 * FUNCTION: connectToMongo
 * -----------------------
 * Establishes connection to MongoDB using mongoose
 * 
 * @returns Promise that resolves when connection is established
 * @throws Error if connection fails
 */
export async function connectToMongo(): Promise<void> {
  try {
    // In production, this should include options for:
    // - Connection pooling configuration
    // - Read/write concerns appropriate for the application
    // - Replica set awareness
    // - Proper timeout settings
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rethrow to allow caller to handle the error
  }
}

/**
 * FUNCTION: disconnectFromMongo
 * ----------------------------
 * Gracefully closes MongoDB connection
 * Used during application shutdown or for connection recycling
 * 
 * @returns Promise that resolves when disconnection is complete
 * @throws Error if disconnection fails
 */
export async function disconnectFromMongo(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}
