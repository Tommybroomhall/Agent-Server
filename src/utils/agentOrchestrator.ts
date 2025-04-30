/**
 * Agent Orchestrator
 * Handles agent selection and processing
 */

import { AgentInput, AgentOutput } from '../types';
import { handleCustomerMessage } from '../agents/customerAgent';
import { handleStaffMessage } from '../agents/staffAgent';
import { handleAdminMessage } from '../agents/adminAgent';
import Log from '../db/models/Log';

/**
 * Processes a message using the appropriate agent
 * @param input The agent input to process
 * @returns The agent output
 */
export async function processAgentMessage(input: AgentInput): Promise<AgentOutput> {
  try {
    // Log the agent request
    await logAgentRequest(input);

    // Process the message based on agent type
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
        throw new Error(`Invalid agent type: ${input.agentType}`);
    }

    // Log the agent response
    await logAgentResponse(input, output);

    return output;
  } catch (error) {
    console.error(`Error processing message with ${input.agentType} agent:`, error);
    
    // Log the error
    await logAgentError(input, error);
    
    // Return a fallback response
    return {
      reply: 'I apologize, but I encountered an error processing your request. Please try again later.',
      actions: [],
    };
  }
}

/**
 * Logs an agent request
 * @param input The agent input
 */
async function logAgentRequest(input: AgentInput): Promise<void> {
  try {
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
    console.error('Error logging agent request:', error);
  }
}

/**
 * Logs an agent response
 * @param input The agent input
 * @param output The agent output
 */
async function logAgentResponse(input: AgentInput, output: AgentOutput): Promise<void> {
  try {
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
    console.error('Error logging agent response:', error);
  }
}

/**
 * Logs an agent error
 * @param input The agent input
 * @param error The error that occurred
 */
async function logAgentError(input: AgentInput, error: any): Promise<void> {
  try {
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
    console.error('Error logging agent error:', logError);
  }
}
