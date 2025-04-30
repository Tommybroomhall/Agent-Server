/**
 * Prompt Builder
 * Utility functions for building prompts for LLM agents
 */

import { AgentInput } from '../types';

/**
 * Builds a system prompt for the customer agent
 * @param context Additional context to include in the prompt
 * @returns The built system prompt
 */
export function buildCustomerAgentPrompt(context: Record<string, any> = {}): string {
  return `
You are a helpful AI assistant for a small business, communicating with customers via WhatsApp.
Your role is to provide friendly, efficient customer service.

CAPABILITIES:
- Answer questions about products and services
- Check order status and provide shipping updates
- Help with basic troubleshooting
- Log customer issues for staff follow-up
- Provide business information (hours, location, etc.)

GUIDELINES:
- Be friendly, professional, and concise
- Use a conversational tone appropriate for WhatsApp
- Keep responses brief and to the point
- If you don't know something, say so and offer to connect the customer with a human
- For complex issues, offer to escalate to staff
- Never make up information about orders or products

${context.orderHistory ? `CUSTOMER ORDER HISTORY:\n${JSON.stringify(context.orderHistory, null, 2)}` : ''}
${context.productInfo ? `PRODUCT INFORMATION:\n${JSON.stringify(context.productInfo, null, 2)}` : ''}
${context.businessInfo ? `BUSINESS INFORMATION:\n${JSON.stringify(context.businessInfo, null, 2)}` : ''}

Remember, you're representing the business, so maintain a professional but friendly tone.
`;
}

/**
 * Builds a system prompt for the staff agent
 * @param context Additional context to include in the prompt
 * @returns The built system prompt
 */
export function buildStaffAgentPrompt(context: Record<string, any> = {}): string {
  return `
You are a helpful AI assistant for a small business, communicating with staff members via WhatsApp.
Your role is to help staff manage inventory, process orders, and handle operational tasks.

CAPABILITIES:
- Process package label images using OCR
- Update inventory levels
- Log new products
- Update order statuses
- Provide sales and inventory reports

GUIDELINES:
- Be efficient and practical
- Focus on helping staff complete tasks quickly
- Use a professional tone
- Confirm actions before making permanent changes
- Provide clear feedback when tasks are completed

${context.inventoryLevels ? `CURRENT INVENTORY LEVELS:\n${JSON.stringify(context.inventoryLevels, null, 2)}` : ''}
${context.pendingOrders ? `PENDING ORDERS:\n${JSON.stringify(context.pendingOrders, null, 2)}` : ''}
${context.staffInfo ? `STAFF INFORMATION:\n${JSON.stringify(context.staffInfo, null, 2)}` : ''}

Remember, you're here to make the staff's job easier and more efficient.
`;
}

/**
 * Builds a system prompt for the admin agent
 * @param context Additional context to include in the prompt
 * @returns The built system prompt
 */
export function buildAdminAgentPrompt(context: Record<string, any> = {}): string {
  return `
You are a helpful AI assistant for a small business, communicating with the business owner or admin via WhatsApp.
Your role is to provide business insights, analytics, and help with administrative tasks.

CAPABILITIES:
- Provide sales and revenue reports
- Share website traffic and analytics data
- Update website content
- Send broadcast messages to customers or staff
- Manage business settings and configurations

GUIDELINES:
- Be data-driven and insightful
- Provide clear, actionable information
- Use a professional, executive-summary style
- Highlight important trends or anomalies
- Offer strategic suggestions when appropriate

${context.salesData ? `SALES DATA:\n${JSON.stringify(context.salesData, null, 2)}` : ''}
${context.trafficData ? `TRAFFIC DATA:\n${JSON.stringify(context.trafficData, null, 2)}` : ''}
${context.businessMetrics ? `BUSINESS METRICS:\n${JSON.stringify(context.businessMetrics, null, 2)}` : ''}

Remember, you're helping the business owner make informed decisions and manage their business effectively.
`;
}

/**
 * Builds a user prompt based on the agent input
 * @param input The agent input
 * @param context Additional context to include in the prompt
 * @returns The built user prompt
 */
export function buildUserPrompt(input: AgentInput, context: Record<string, any> = {}): string {
  let prompt = input.message;
  
  // Add context about the sender
  if (context.senderInfo) {
    prompt = `[Sender: ${context.senderInfo.name || 'Unknown'}, ID: ${input.senderId}]\n\n${prompt}`;
  }
  
  // Add context about media if present
  if (input.mediaUrl) {
    prompt = `[Media attached: ${input.mediaUrl}]\n\n${prompt}`;
  }
  
  // Add timestamp
  prompt = `[Time: ${input.timestamp}]\n\n${prompt}`;
  
  return prompt;
}

/**
 * Builds a context object for the agent
 * @param agentType The type of agent
 * @param senderId The ID of the sender
 * @returns The built context object
 */
export async function buildAgentContext(
  agentType: 'customer' | 'staff' | 'admin',
  senderId: string
): Promise<Record<string, any>> {
  // This is a placeholder implementation
  // In a real implementation, we would fetch relevant data from the database
  
  const context: Record<string, any> = {
    senderInfo: {
      id: senderId,
      name: `Test ${agentType.charAt(0).toUpperCase() + agentType.slice(1)}`,
    },
  };
  
  // Add agent-specific context
  switch (agentType) {
    case 'customer':
      context.orderHistory = [
        {
          orderId: '12345',
          date: '2023-05-15',
          status: 'delivered',
          items: [
            { name: 'Premium Widget', quantity: 1, price: 49.99 },
            { name: 'Standard Widget', quantity: 2, price: 29.99 },
          ],
        },
        {
          orderId: '12346',
          date: '2023-06-01',
          status: 'processing',
          items: [
            { name: 'Deluxe Package', quantity: 1, price: 99.99 },
          ],
        },
      ];
      break;
    case 'staff':
      context.pendingOrders = [
        {
          orderId: '12346',
          customerName: 'John Doe',
          date: '2023-06-01',
          status: 'processing',
          items: [
            { name: 'Deluxe Package', quantity: 1, price: 99.99 },
          ],
        },
        {
          orderId: '12347',
          customerName: 'Jane Smith',
          date: '2023-06-02',
          status: 'pending',
          items: [
            { name: 'Premium Widget', quantity: 3, price: 49.99 },
          ],
        },
      ];
      context.inventoryLevels = [
        { name: 'Premium Widget', sku: 'PW001', stock: 15 },
        { name: 'Standard Widget', sku: 'SW001', stock: 27 },
        { name: 'Basic Widget', sku: 'BW001', stock: 42 },
        { name: 'Deluxe Package', sku: 'DP001', stock: 8 },
        { name: 'Starter Kit', sku: 'SK001', stock: 12 },
      ];
      break;
    case 'admin':
      context.salesData = {
        today: { orders: 5, revenue: 349.95 },
        week: { orders: 32, revenue: 2245.67 },
        month: { orders: 128, revenue: 8976.54 },
      };
      context.trafficData = {
        today: { visitors: 156, pageViews: 423, conversionRate: 3.2 },
        week: { visitors: 1024, pageViews: 2876, conversionRate: 3.1 },
        month: { visitors: 4267, pageViews: 12543, conversionRate: 3.0 },
      };
      break;
  }
  
  return context;
}
