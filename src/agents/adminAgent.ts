/**
 * Admin Agent
 * Provides real-time business metrics, sales data, and allows content updates or campaign triggers
 */

import { AgentInput, AgentOutput } from '../types';
import { User, Order, Message, Log, Staff, Admin, AuthorizedNumber } from '../db/models';
import { authService } from '../services';

/**
 * Handles incoming admin messages
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
export async function handleAdminMessage(input: AgentInput): Promise<AgentOutput> {
  try {
    // Log the incoming message
    await logMessage(input);

    // Process the message and generate a response
    const response = await processAdminMessage(input);

    return response;
  } catch (error) {
    console.error('Error in admin agent:', error);
    return {
      reply: 'I apologize, but I encountered an error processing your request. Please try again later.',
      actions: [],
    };
  }
}

/**
 * Processes admin messages and generates appropriate responses
 * @param input The agent input containing message details
 * @returns Agent output with reply and actions
 */
async function processAdminMessage(input: AgentInput): Promise<AgentOutput> {
  const { message } = input;

  // Process different types of admin requests
  if (message.toLowerCase().includes('sales')) {
    return handleSalesQuery(message);
  } else if (message.toLowerCase().includes('traffic') || message.toLowerCase().includes('analytics')) {
    return handleTrafficQuery(message);
  } else if (message.toLowerCase().includes('update') && message.toLowerCase().includes('content')) {
    return handleContentUpdate(message);
  } else if (message.toLowerCase().includes('broadcast') || message.toLowerCase().includes('promotion')) {
    return handleBroadcastRequest(message);
  } else if (message.toLowerCase().includes('add') && message.toLowerCase().includes('staff')) {
    return handleAddStaffRequest(message, input.senderId);
  } else if (message.toLowerCase().includes('list') && message.toLowerCase().includes('staff')) {
    return handleListStaffRequest();
  } else if ((message.toLowerCase().includes('remove') || message.toLowerCase().includes('delete')) && message.toLowerCase().includes('staff')) {
    return handleRemoveStaffRequest(message);
  } else if ((message.toLowerCase().includes('activate') || message.toLowerCase().includes('deactivate')) && message.toLowerCase().includes('staff')) {
    return handleUpdateStaffStatusRequest(message);
  } else {
    return {
      reply: `Hello admin. You can ask me about:
1. Sales data (daily, weekly, monthly)
2. Website traffic and analytics
3. Content updates for your website
4. Broadcasting promotions or alerts to customers or staff
5. Staff management:
   - Add staff: "Add staff: [name], [email], [phone], [role]"
   - List staff: "List all staff"
   - Remove staff: "Remove staff: [phone]"
   - Activate/Deactivate staff: "Activate staff: [phone]" or "Deactivate staff: [phone]"`,
      actions: [],
    };
  }
}

/**
 * Handles sales-related queries
 * @param message The message containing the sales query
 * @returns Agent output with sales information
 */
async function handleSalesQuery(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would query the database for sales data

  // Determine the time period for the sales query
  let timePeriod = 'today';
  if (message.toLowerCase().includes('week')) {
    timePeriod = 'this week';
  } else if (message.toLowerCase().includes('month')) {
    timePeriod = 'this month';
  } else if (message.toLowerCase().includes('year')) {
    timePeriod = 'this year';
  }

  return {
    reply: `Here's a summary of your sales for ${timePeriod}:

Total Orders: 42
Revenue: $3,850.75
Average Order Value: $91.68
Top Product: Premium Widget

Please note this is a demo response. In the full implementation, I would provide actual sales data from your database.`,
    actions: [],
  };
}

/**
 * Handles traffic and analytics queries
 * @param message The message containing the traffic query
 * @returns Agent output with traffic information
 */
async function handleTrafficQuery(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would query analytics APIs
  return {
    reply: `Here's your website traffic summary:

Visitors Today: 156
Page Views: 423
Conversion Rate: 3.2%
Top Source: Google Search

Please note this is a demo response. In the full implementation, I would provide actual traffic data from your analytics platform.`,
    actions: [],
  };
}

/**
 * Handles content update requests
 * @param message The message containing the content update request
 * @returns Agent output with content update confirmation
 */
async function handleContentUpdate(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would use the Vercel API to update content
  return {
    reply: `I've processed your content update request. Please note this is a demo response. In the full implementation, I would update your website content based on your instructions.`,
    actions: [],
  };
}

/**
 * Handles broadcast and promotion requests
 * @param message The message containing the broadcast request
 * @returns Agent output with broadcast confirmation
 */
async function handleBroadcastRequest(message: string): Promise<AgentOutput> {
  // This is a placeholder implementation
  // In a real implementation, we would send messages to customers or staff
  return {
    reply: `I've prepared your broadcast message. Please note this is a demo response. In the full implementation, I would send your message to the specified audience.`,
    actions: ['email', 'whatsapp'],
  };
}

/**
 * Handles adding a new staff member
 * @param message The message containing the staff details
 * @param adminPhone The phone number of the admin making the request
 * @returns Agent output with staff addition confirmation
 */
async function handleAddStaffRequest(message: string, adminPhone: string): Promise<AgentOutput> {
  try {
    // Extract staff details from the message
    // Expected format: "Add staff: [name], [email], [phone], [role]"
    const staffDetails = message.substring(message.indexOf(':') + 1).trim();
    const [name, email, phone, role] = staffDetails.split(',').map(item => item.trim());

    // Validate required fields
    if (!name || !email || !phone) {
      return {
        reply: 'Please provide all required staff details: name, email, and phone number. Format: "Add staff: [name], [email], [phone], [role]"',
        actions: [],
      };
    }

    // Validate role
    const validRoles = ['inventory', 'customer-service', 'shipping', 'general'];
    const staffRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'general';

    // Get admin ID from phone number
    const adminId = await authService.getUserIdFromPhone(adminPhone, 'admin');

    if (!adminId) {
      return {
        reply: 'You do not have permission to add staff members. Only registered admins can perform this action.',
        actions: [],
      };
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10);

    // Create the staff member
    const staff = await authService.createStaff(
      {
        name,
        email,
        phone,
        password: tempPassword,
        role: staffRole as any,
      },
      adminId
    );

    return {
      reply: `Staff member added successfully:
Name: ${staff.name}
Email: ${staff.email}
Phone: ${staff.phone}
Role: ${staff.role}
Temporary Password: ${tempPassword}

Please share these credentials with the staff member and ask them to change their password on first login.`,
      actions: ['email'],
    };
  } catch (error) {
    console.error('Error adding staff member:', error);
    return {
      reply: `Error adding staff member: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions: [],
    };
  }
}

/**
 * Handles listing all staff members
 * @returns Agent output with staff list
 */
async function handleListStaffRequest(): Promise<AgentOutput> {
  try {
    // Get all active staff members
    const staffMembers = await authService.getAllStaff({ isActive: true });

    if (staffMembers.length === 0) {
      return {
        reply: 'No staff members found.',
        actions: [],
      };
    }

    // Format the staff list
    const staffList = staffMembers.map(staff => `
Name: ${staff.name}
Email: ${staff.email}
Phone: ${staff.phone}
Role: ${staff.role}
Created: ${new Date(staff.createdAt).toLocaleDateString()}
`).join('\n---\n');

    return {
      reply: `Here are all active staff members:\n${staffList}`,
      actions: [],
    };
  } catch (error) {
    console.error('Error listing staff members:', error);
    return {
      reply: `Error listing staff members: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions: [],
    };
  }
}

/**
 * Handles removing a staff member
 * @param message The message containing the staff phone number
 * @returns Agent output with staff removal confirmation
 */
async function handleRemoveStaffRequest(message: string): Promise<AgentOutput> {
  try {
    // Extract phone number from the message
    // Expected format: "Remove staff: [phone]"
    const phone = message.substring(message.indexOf(':') + 1).trim();

    if (!phone) {
      return {
        reply: 'Please provide the phone number of the staff member to remove. Format: "Remove staff: [phone]"',
        actions: [],
      };
    }

    // Get staff ID from phone number
    const staffId = await authService.getUserIdFromPhone(phone, 'staff');

    if (!staffId) {
      return {
        reply: `No staff member found with phone number ${phone}.`,
        actions: [],
      };
    }

    // Remove the staff member's authorization
    const success = await authService.removeAuthorizedNumber(phone);

    if (success) {
      return {
        reply: `Staff member with phone number ${phone} has been removed from the system.`,
        actions: [],
      };
    } else {
      return {
        reply: `Failed to remove staff member with phone number ${phone}.`,
        actions: [],
      };
    }
  } catch (error) {
    console.error('Error removing staff member:', error);
    return {
      reply: `Error removing staff member: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions: [],
    };
  }
}

/**
 * Handles updating a staff member's status
 * @param message The message containing the staff phone number and desired status
 * @returns Agent output with staff status update confirmation
 */
async function handleUpdateStaffStatusRequest(message: string): Promise<AgentOutput> {
  try {
    // Determine if activating or deactivating
    const isActivating = message.toLowerCase().includes('activate') && !message.toLowerCase().includes('deactivate');

    // Extract phone number from the message
    // Expected format: "Activate staff: [phone]" or "Deactivate staff: [phone]"
    const phone = message.substring(message.indexOf(':') + 1).trim();

    if (!phone) {
      return {
        reply: `Please provide the phone number of the staff member to ${isActivating ? 'activate' : 'deactivate'}. Format: "${isActivating ? 'Activate' : 'Deactivate'} staff: [phone]"`,
        actions: [],
      };
    }

    // Get staff ID from phone number
    const staffId = await authService.getUserIdFromPhone(phone, 'staff');

    if (!staffId) {
      return {
        reply: `No staff member found with phone number ${phone}.`,
        actions: [],
      };
    }

    // Update the staff member's status
    const success = await authService.updateStaffStatus(staffId, isActivating);

    if (success) {
      return {
        reply: `Staff member with phone number ${phone} has been ${isActivating ? 'activated' : 'deactivated'}.`,
        actions: [],
      };
    } else {
      return {
        reply: `Failed to ${isActivating ? 'activate' : 'deactivate'} staff member with phone number ${phone}.`,
        actions: [],
      };
    }
  } catch (error) {
    console.error('Error updating staff status:', error);
    return {
      reply: `Error updating staff status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions: [],
    };
  }
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
      agentType: 'admin',
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
