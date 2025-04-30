import { AgentType, Message } from '../types';

// Helper function to create a message
const createMessage = (
  id: string,
  text: string,
  sender: 'user' | 'agent',
  timestamp: Date,
  mediaUrl?: string
): Message => ({
  id,
  text,
  sender,
  timestamp,
  mediaUrl,
});

// Mock messages for the customer agent
const customerMockMessages: Message[] = [
  createMessage(
    '1',
    'Hello! I\'m your Customer Service AI assistant. How can I help you today?',
    'agent',
    new Date(Date.now() - 60000 * 5)
  ),
];

// Mock messages for the staff agent
const staffMockMessages: Message[] = [
  createMessage(
    '1',
    'Hello! I\'m your Staff AI assistant. I can help with inventory, order processing, and more. What would you like to do?',
    'agent',
    new Date(Date.now() - 60000 * 5)
  ),
];

// Mock messages for the admin agent
const adminMockMessages: Message[] = [
  createMessage(
    '1',
    'Hello! I\'m your Admin AI assistant. I can provide business insights, update content, and help with administrative tasks. What would you like to know?',
    'agent',
    new Date(Date.now() - 60000 * 5)
  ),
];

// Function to get mock messages based on agent type
export const getMockMessages = (agentType: AgentType): Message[] => {
  switch (agentType) {
    case 'customer':
      return [...customerMockMessages];
    case 'staff':
      return [...staffMockMessages];
    case 'admin':
      return [...adminMockMessages];
    default:
      return [];
  }
};
