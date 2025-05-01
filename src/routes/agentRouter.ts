/**
 * FILE: src/routes/agentRouter.ts
 * ==============================
 * AGENT ROUTER
 *
 * PURPOSE:
 * Provides HTTP endpoints for interacting with the three agent types:
 * - Customer Agent (/agent/customer)
 * - Staff Agent (/agent/staff)
 * - Admin Agent (/agent/admin)
 *
 * This router is responsible for validating incoming requests and routing them to the
 * appropriate agent processor via the agent orchestrator.
 *
 * CONNECTIONS:
 * - Imported by src/index.ts and mounted at /agent prefix
 * - Uses ../utils/agentOrchestrator.ts to process agent messages
 * - Depends on ../types for AgentInput and AgentOutput interfaces
 *
 * PRODUCTION BEHAVIOR:
 * 1. Receives HTTP POST requests with agent messages
 * 2. Validates the input format for the specific agent type
 * 3. Forwards valid requests to the agent orchestrator
 * 4. Returns standardized JSON responses with success/failure status
 * 5. Handles errors with appropriate HTTP status codes
 *
 * API ENDPOINTS:
 * - POST /agent/customer - Process customer agent messages
 * - POST /agent/staff - Process staff agent messages
 * - POST /agent/admin - Process admin agent messages
 *
 * SECURITY NOTES:
 * - In production, these endpoints should be protected with authentication
 * - Rate limiting should be applied to prevent abuse
 * - Input validation is crucial to prevent security vulnerabilities
 */

import express, { Request, Response, NextFunction } from 'express';
import { AgentInput, AgentOutput } from '../types';
import { processAgentMessage } from '../utils/agentOrchestrator';
import { authService } from '../services';

const router = express.Router();

/**
 * SECTION: Input Validation
 * ------------------------
 */

/**
 * FUNCTION: validateAgentInput
 * ---------------------------
 * Validates incoming agent message payload to ensure it contains all required fields
 * and that the agent type is valid.
 *
 * @param input The payload to validate
 * @returns True if the input is valid, false otherwise
 *
 * VALIDATION CRITERIA:
 * - senderId must be a string (identifies the message sender)
 * - message must be a string (the actual message content)
 * - timestamp must be a string (when the message was sent)
 * - agentType must be one of: 'customer', 'staff', 'admin'
 */
function validateAgentInput(input: any): boolean {
  return (
    input &&
    typeof input.senderId === 'string' &&
    typeof input.message === 'string' &&
    typeof input.timestamp === 'string' &&
    ['customer', 'staff', 'admin'].includes(input.agentType)
  );
}

/**
 * SECTION: Request Handling
 * ------------------------
 */

/**
 * FUNCTION: handleAgentMessage
 * ---------------------------
 * Core handler function for all agent endpoints that processes agent messages
 * and returns appropriate responses.
 *
 * @param req Express request object containing the message payload
 * @param res Express response object for sending back the result
 * @param agentType Type of agent to handle the message (customer, staff, admin)
 *
 * WORKFLOW:
 * 1. Extracts and validates input from request body
 * 2. Processes message through agent orchestrator
 * 3. Returns standardized response with result or error
 */
async function handleAgentMessage(req: Request, res: Response, agentType: 'customer' | 'staff' | 'admin'): Promise<void> {
  try {
    // Construct input object with request body and specified agent type
    const input: AgentInput = {
      ...req.body,
      agentType,
    };

    // Validate input structure and required fields
    if (!validateAgentInput(input)) {
      res.status(400).json({
        success: false,
        message: 'Invalid input. Required fields: senderId, message, timestamp, agentType',
      });
      return;
    }

    // Process the message using the agent orchestrator
    // This is where the actual agent logic is applied
    const output = await processAgentMessage(input);

    // Return successful response with agent's output
    res.status(200).json({
      success: true,
      data: output,
    });
  } catch (error) {
    // Log error for monitoring and debugging
    console.error(`Error handling ${agentType} message:`, error);

    // Return standardized error response
    // In production, avoid exposing detailed error information
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

/**
 * SECTION: Authorization Middleware
 * -------------------------------
 * Middleware to check if a phone number is authorized for a specific agent type
 */

/**
 * FUNCTION: authorizeAgentAccess
 * -----------------------------
 * Middleware that checks if the sender is authorized to access the specified agent type
 *
 * @param agentType Type of agent to check authorization for
 * @returns Express middleware function
 */
function authorizeAgentAccess(agentType: 'customer' | 'staff' | 'admin') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { senderId } = req.body;

      // Skip authorization check if no senderId is provided (for development/testing)
      if (!senderId) {
        console.warn(`No senderId provided for ${agentType} agent access. Skipping authorization check.`);
        return next();
      }

      // Check if the sender is authorized for this agent type
      const isAuthorized = await authService.isAuthorizedForAgentType(senderId, agentType);

      if (!isAuthorized && agentType !== 'customer') {
        return res.status(403).json({
          success: false,
          message: `Unauthorized access to ${agentType} agent. This number is not registered.`
        });
      }

      // If authorized or customer agent, proceed to the next middleware
      next();
    } catch (error) {
      console.error(`Error authorizing access to ${agentType} agent:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
}

/**
 * SECTION: Endpoint Registration
 * ----------------------------
 * Each agent type has a dedicated endpoint that receives POST requests
 * All endpoints use the same handler function with the appropriate agent type
 */

// Customer agent endpoint
// In production: Receives customer inquiries, order status requests, etc.
// All phone numbers can access the customer agent
router.post('/customer', authorizeAgentAccess('customer'), (req: Request, res: Response) => {
  handleAgentMessage(req, res, 'customer');
});

// Staff agent endpoint
// In production: Receives inventory updates, packaging confirmations, etc.
// Only authorized staff phone numbers can access the staff agent
router.post('/staff', authorizeAgentAccess('staff'), (req: Request, res: Response) => {
  handleAgentMessage(req, res, 'staff');
});

// Admin agent endpoint
// In production: Receives business metrics requests, content update commands, etc.
// Only authorized admin phone numbers can access the admin agent
router.post('/admin', authorizeAgentAccess('admin'), (req: Request, res: Response) => {
  handleAgentMessage(req, res, 'admin');
});

export { router as agentRouter };
