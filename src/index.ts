/**
 * FILE: src/index.ts
 * ==================
 * MAIN SERVER ENTRY POINT
 * 
 * PURPOSE:
 * Main Express server application entry point that initializes the WhatsApp-Based AI Business Assistant.
 * This file bootstraps the entire application and serves as the central hub connecting all components.
 * 
 * CONNECTIONS:
 * - Imports routes from './routes/agentRouter' (handles agent-specific endpoints)
 * - Imports routes from './routes/webhookRouter' (handles external service webhooks)
 * - Connects to MongoDB via './db/connect'
 * 
 * PRODUCTION BEHAVIOR:
 * In production, this server will:
 * 1. Load environment variables from .env file (or environment)
 * 2. Initialize Express with JSON body parsing and CORS support
 * 3. Connect to MongoDB Atlas database
 * 4. Mount agent and webhook routers to their respective endpoints
 * 5. Provide a health check endpoint for monitoring
 * 6. Listen on the specified port (from environment or default to 3001)
 * 
 * DEPLOYMENT NOTES:
 * - Requires environment variables as specified in .env.example
 * - Should be deployed behind a reverse proxy (nginx/Apache) for SSL termination
 * - MongoDB connection handles should be pooled for production scale
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRouter } from './routes/agentRouter';
import { webhookRouter } from './routes/webhookRouter';
import { connectToMongo } from './db/connect';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// SECTION: Middleware Configuration
// --------------------------------
// Apply middleware for parsing JSON bodies and enabling cross-origin requests
// In production, CORS should be configured with specific origins
app.use(express.json());
app.use(cors());

// SECTION: Route Registration
// --------------------------
// Mount routers that will handle different types of requests
// /agent/* - For direct agent interaction endpoints (customer, staff, admin)
// /webhook/* - For receiving callbacks from external services (WhatsApp, Stripe, etc.)
app.use('/agent', agentRouter);
app.use('/webhook', webhookRouter);

// SECTION: Health Check Endpoint
// ----------------------------
// Simple endpoint for monitoring services to verify server is running
// In production, this should be extended with deeper health checks (DB connectivity, etc.)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Agent server is running' });
});

// SECTION: Server Initialization
// ----------------------------
// Connect to MongoDB before starting the HTTP server
// If database connection fails, the application will terminate
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Agent server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
