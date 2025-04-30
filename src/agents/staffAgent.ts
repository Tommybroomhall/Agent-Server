/**
 * Staff Agent
 * Manages inventory updates, sends packaging confirmations, and logs stock changes
 */

import { AgentInput, AgentOutput, OCRResult } from '../types';
import Order from '../db/models/Order';
import Inventory from '../db/models/Inventory';
import Message from '../db/models/Message';
import Log from '../db/models/Log';

/**
 * Handles incoming staff messages
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
export async function handleStaffMessage(input: AgentInput): Promise<AgentOutput> {
  try {
    // Log the incoming message
    await logMessage(input);

    // Process the message and generate a response
    const response = await processStaffMessage(input);

    return response;
  } catch (error) {
    console.error('Error in staff agent:', error);
    return {
      reply: 'I apologize, but I encountered an error processing your request. Please try again later.',
      actions: [],
    };
  }
}

/**
 * Processes staff messages and generates appropriate responses
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
async function processStaffMessage(input: AgentInput): Promise<AgentOutput> {
  const { message, mediaUrl } = input;
  
  // Check if the message contains an image
  if (mediaUrl) {
    return handleImageProcessing(mediaUrl);
  }
  
  // Process text-based commands
  if (message.toLowerCase().includes('stock take')) {
    return handleStockTake(message);
  } else if (message.toLowerCase().includes('new product')) {
    return handleNewProduct(message);
  } else if (message.toLowerCase().includes('order update')) {
    return handleOrderUpdate(message);
  } else {
    return {
      reply: `Hello staff member. You can send me:
1. Package label images for processing
2. "Stock take" messages to update inventory
3. "New product" details to add to inventory
4. "Order update" to change order status`,
      actions: [],
    };
  }
}

/**
 * Handles image processing for package labels
 * @param mediaUrl The URL of the media to process
 * @returns Agent output with image processing results
 */
async function handleImageProcessing(mediaUrl: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would use OCR to extract information from the image
  
  // Simulate OCR processing
  const ocrResult: OCRResult = {
    text: "Sample Order #12345\nCustomer: John Doe\nAddress: 123 Main St, Anytown, USA",
    confidence: 0.95,
  };
  
  return {
    reply: `I've processed the image and extracted the following information:
Order #: 12345
Customer: John Doe
Address: 123 Main St, Anytown, USA

Would you like me to update this order as shipped?`,
    actions: ['whatsapp'],
  };
}

/**
 * Handles stock take messages
 * @param message The message containing stock information
 * @returns Agent output with stock update confirmation
 */
async function handleStockTake(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would parse the message and update inventory
  return {
    reply: `I've recorded your stock take. Please note this is a demo response. In the full implementation, I would update the inventory based on your message.`,
    actions: [],
  };
}

/**
 * Handles new product messages
 * @param message The message containing new product information
 * @returns Agent output with new product confirmation
 */
async function handleNewProduct(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would parse the message and add a new product
  return {
    reply: `I've added the new product to the inventory. Please note this is a demo response. In the full implementation, I would create a new product based on your message.`,
    actions: [],
  };
}

/**
 * Handles order update messages
 * @param message The message containing order update information
 * @returns Agent output with order update confirmation
 */
async function handleOrderUpdate(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would parse the message and update the order
  return {
    reply: `I've updated the order status. Please note this is a demo response. In the full implementation, I would update the order based on your message.`,
    actions: ['email', 'whatsapp'],
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
      agentType: 'staff',
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
