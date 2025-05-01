/**
 * FILE: src/utils/agentOrchestrator.ts
 * ===================================
 * AGENT ORCHESTRATOR
 * 
 * PURPOSE:
 * Central coordination layer that routes messages to the appropriate agent handler,
 * manages logging, and provides error handling across the agent system. This file
 * serves as the "traffic controller" for all agent interactions.
 * 
 * CONNECTIONS:
 * - Used by src/routes/agentRouter.ts to process agent-specific requests
 * - Used by src/routes/webhookRouter.ts to process webhook messages
 * - Imports agent handlers from ../agents/ directory
 * - Uses Log model from ../db/models/Log for audit trail
 * - Depends on ../types for AgentInput and AgentOutput interfaces
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Receives message input with agent type designation
 * 2. Routes to the appropriate specialized agent handler
 * 3. Logs request, response, and any errors for monitoring and audit
 * 4. Provides centralized error handling with fallback responses
 * 5. Maintains consistent response format across all agent types
 * 
 * SIGNIFICANCE:
 * This orchestration layer decouples the routing/API layer from the
 * agent-specific business logic, allowing each agent to focus on its
 * specialized functionality without worrying about the surrounding infrastructure.
 */

import { AgentInput, AgentOutput } from '../types';
import { handleCustomerMessage } from '../agents/customerAgent';
import { handleStaffMessage } from '../agents/staffAgent';
import { handleAdminMessage } from '../agents/adminAgent';
import Log from '../db/models/Log';

/**
 * SECTION: Message Processing
 * -------------------------
 */

/**
 * FUNCTION: processAgentMessage
 * ---------------------------
 * Core orchestration function that routes messages to the appropriate agent handler.
 * 
 * @param input The standardized agent input containing message details and agent type
 * @returns Agent output with reply text and required actions
 * 
 * WORKFLOW:
 * 1. Logs the incoming request for audit and monitoring
 * 2. Routes to specialized agent handler based on agent type
 * 3. Logs the agent's response for completeness
 * 4. Handles any errors with logging and fallback responses
 * 
 * PRODUCTION ENHANCEMENTS:
 * - Add request validation with detailed error messages
 * - Implement request throttling and rate limiting
 * - Add performance monitoring and timing metrics
 * - Consider adding circuit breakers for failing services
 */
export async function processAgentMessage(input: AgentInput): Promise<AgentOutput> {
  try {
    // Log the agent request for audit trail and analytics
    await logAgentRequest(input);

    // Process the message using the appropriate specialized agent
    // Each agent type has its own handler with specific business logic
    let output: AgentOutput;
    switch (input.agentType) {
      case 'customer':
        output = await handleCustomerMessage(input);
        break;
      case 'staff':
        output = await handleStaffMessage(input);
        break;
      case 'admin':
        output = await handleAdminMessage(input);
        break;
      default:
        // TypeScript should prevent this, but we handle it for runtime safety
        throw new Error(`Invalid agent type: ${input.agentType}`);
    }

    // Log the agent response for completeness of the audit trail
    await logAgentResponse(input, output);

    return output;
  } catch (error) {
    // Log detailed error information for debugging and monitoring
    console.error(`Error processing message with ${input.agentType} agent:`, error);
    
    // Create persistent error log for analysis and alerting
    await logAgentError(input, error);
    
    // Provide a graceful fallback response to the user
    // In production, this could be customized by agent type or error type
    return {
      reply: 'I apologize, but I encountered an error processing your request. Please try again later.',
      actions: [],
    };
  }
}

/**
 * SECTION: Logging Functions
 * ------------------------
 * These functions maintain a complete audit trail of all agent interactions
 */

/**
 * FUNCTION: logAgentRequest
 * -----------------------
 * Creates a log entry for incoming agent requests.
 * 
 * @param input The agent input to log
 * 
 * PURPOSE:
 * - Creates audit trail for compliance and debugging
 * - Enables request volume monitoring and analytics
 * - Supports user behavior analysis
 * 
 * PRODUCTION CONSIDERATIONS:
 * - Consider logging to a separate high-performance data store
 * - Implement log rotation or TTL for high-volume environments
 * - May need to handle PII (Personally Identifiable Information) appropriately
 */
async function logAgentRequest(input: AgentInput): Promise<void> {
  try {
    // Create a structured log entry in the database
    await Log.create({
      agentType: input.agentType,
      action: 'agent_request',
      details: {
        senderId: input.senderId,
        message: input.message,
        mediaUrl: input.mediaUrl,
        timestamp: input.timestamp,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    // Log to console but don't interrupt main flow if logging fails
    // In production, should implement better error handling for logging failures
    console.error('Error logging agent request:', error);
  }
}

/**
 * FUNCTION: logAgentResponse
 * ------------------------
 * Creates a log entry for agent responses before they're sent.
 * 
 * @param input The original agent input
 * @param output The agent output being sent
 * 
 * PURPOSE:
 * - Completes the request-response audit trail
 * - Enables analysis of agent response patterns
 * - Supports quality monitoring and improvement
 */
async function logAgentResponse(input: AgentInput, output: AgentOutput): Promise<void> {
  try {
    // Create a structured log entry in the database
    // Links the response to the original request via senderId
    await Log.create({
      agentType: input.agentType,
      action: 'agent_response',
      details: {
        senderId: input.senderId,
        reply: output.reply,
        actions: output.actions,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    // Log to console but don't interrupt main flow if logging fails
    console.error('Error logging agent response:', error);
  }
}

/**
 * FUNCTION: logAgentError
 * ---------------------
 * Creates a log entry for errors that occur during agent processing.
 * 
 * @param input The agent input that caused the error
 * @param error The error that occurred
 * 
 * PURPOSE:
 * - Provides detailed error tracking for debugging
 * - Enables error pattern analysis and alerting
 * - Supports system reliability monitoring
 * 
 * PRODUCTION ENHANCEMENT:
 * - Should integrate with application monitoring system
 * - Could trigger real-time alerts for critical errors
 * - Should implement error categorization for better analysis
 */
async function logAgentError(input: AgentInput, error: any): Promise<void> {
  try {
    // Create a structured error log entry in the database
    await Log.create({
      agentType: input.agentType,
      action: 'agent_error',
      details: {
        senderId: input.senderId,
        message: input.message,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    });
  } catch (logError) {
    // Last resort: log to console if database logging fails
    // In production, should have redundant error reporting mechanisms
    console.error('Error logging agent error:', logError);
  }
}
