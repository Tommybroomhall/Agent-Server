/**
 * Customer Agent
 * Handles customer queries, order statuses, and issue reporting
 */

import { AgentInput, AgentOutput } from '../types';
import User from '../db/models/User';
import Order from '../db/models/Order';
import Message from '../db/models/Message';
import Log from '../db/models/Log';

/**
 * Handles incoming customer messages
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
export async function handleCustomerMessage(input: AgentInput): Promise<AgentOutput> {
  try {
    // Log the incoming message
    await logMessage(input);

    // Process the message and generate a response
    const response = await processCustomerMessage(input);

    return response;
  } catch (error) {
    console.error('Error in customer agent:', error);
    return {
      reply: 'I apologize, but I encountered an error processing your request. Please try again later.',
      actions: [],
    };
  }
}

/**
 * Processes customer messages and generates appropriate responses
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
async function processCustomerMessage(input: AgentInput): Promise<AgentOutput> {
  const { message, senderId } = input;
  
  // Simple message processing logic (to be expanded)
  if (message.toLowerCase().includes('order status')) {
    return handleOrderStatusQuery(senderId);
  } else if (message.toLowerCase().includes('help')) {
    return provideHelp();
  } else if (message.toLowerCase().includes('issue') || message.toLowerCase().includes('problem')) {
    return handleIssueReport(input);
  } else {
    return {
      reply: `Thank you for your message. How can I assist you today? You can ask about your order status, report an issue, or get help with our products.`,
      actions: [],
    };
  }
}

/**
 * Handles order status queries
 * @param senderId The ID of the sender
 * @returns Agent output with order status information
 */
async function handleOrderStatusQuery(senderId: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would query the database for the customer's orders
  return {
    reply: `I'll check your recent order status for you. Please note this is a demo response. In the full implementation, I would provide details about your specific orders.`,
    actions: [],
  };
}

/**
 * Provides help information to the customer
 * @returns Agent output with help information
 */
function provideHelp(): AgentOutput {
  return {
    reply: `I'm here to help! You can ask me about:
1. Your order status
2. Product information
3. Reporting issues with your order
4. Delivery information

Just let me know what you need assistance with.`,
    actions: [],
  };
}

/**
 * Handles issue reports from customers
 * @param input The agent input containing message details
 * @returns Agent output with issue handling information
 */
async function handleIssueReport(input: AgentInput): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would create an issue in the database
  return {
    reply: `I'm sorry to hear you're experiencing an issue. I've logged this report and our team will look into it. Could you please provide more details about the problem you're facing?`,
    actions: ['email'],
  };
}

/**
 * Logs incoming messages to the database
 * @param input The agent input containing message details
 */
async function logMessage(input: AgentInput): Promise<void> {
  try {
    // Create a new message record
    await Message.create({
      senderId: input.senderId,
      receiverId: 'system',
      content: input.message,
      mediaUrl: input.mediaUrl,
      direction: 'inbound',
      agentType: input.agentType,
      timestamp: new Date(input.timestamp),
    });

    // Log the action
    await Log.create({
      agentType: 'customer',
      action: 'message_received',
      details: {
        senderId: input.senderId,
        message: input.message,
        timestamp: input.timestamp,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging message:', error);
  }
}
