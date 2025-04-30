/**
 * Message Parser
 * Utility functions for parsing and processing messages
 */

/**
 * Extracts command and parameters from a message
 * @param message The message to parse
 * @returns The extracted command and parameters
 */
export function parseCommand(message: string): {
  command: string | null;
  params: Record<string, string>;
} {
  // Initialize result
  const result = {
    command: null,
    params: {},
  };

  // Check if the message is empty
  if (!message || typeof message !== 'string') {
    return result;
  }

  // Normalize the message
  const normalizedMessage = message.trim().toLowerCase();

  // Extract command
  // Commands are expected to be at the beginning of the message
  // and can be followed by parameters
  const commandPatterns = [
    { regex: /^order status/i, command: 'order_status' },
    { regex: /^track order/i, command: 'track_order' },
    { regex: /^report issue/i, command: 'report_issue' },
    { regex: /^help/i, command: 'help' },
    { regex: /^stock take/i, command: 'stock_take' },
    { regex: /^new product/i, command: 'new_product' },
    { regex: /^update order/i, command: 'update_order' },
    { regex: /^sales report/i, command: 'sales_report' },
    { regex: /^traffic report/i, command: 'traffic_report' },
    { regex: /^update content/i, command: 'update_content' },
    { regex: /^broadcast/i, command: 'broadcast' },
  ];

  // Check for command matches
  for (const pattern of commandPatterns) {
    if (pattern.regex.test(normalizedMessage)) {
      result.command = pattern.command;
      break;
    }
  }

  // Extract parameters
  // Parameters are expected to be in the format "key: value"
  const paramRegex = /(\w+):\s*([^,]+)(?:,|$)/g;
  let match;
  while ((match = paramRegex.exec(message)) !== null) {
    const [, key, value] = match;
    result.params[key.trim().toLowerCase()] = value.trim();
  }

  // Extract order ID if present
  const orderIdMatch = message.match(/#(\d+)/);
  if (orderIdMatch) {
    result.params.orderId = orderIdMatch[1];
  }

  return result;
}

/**
 * Extracts entities from a message
 * @param message The message to parse
 * @returns The extracted entities
 */
export function extractEntities(message: string): {
  orderIds: string[];
  emails: string[];
  phoneNumbers: string[];
  dates: string[];
  productNames: string[];
} {
  // Initialize result
  const result = {
    orderIds: [],
    emails: [],
    phoneNumbers: [],
    dates: [],
    productNames: [],
  };

  // Check if the message is empty
  if (!message || typeof message !== 'string') {
    return result;
  }

  // Extract order IDs
  const orderIdRegex = /#(\d+)/g;
  let orderIdMatch;
  while ((orderIdMatch = orderIdRegex.exec(message)) !== null) {
    result.orderIds.push(orderIdMatch[1]);
  }

  // Extract emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
  let emailMatch;
  while ((emailMatch = emailRegex.exec(message)) !== null) {
    result.emails.push(emailMatch[1]);
  }

  // Extract phone numbers
  const phoneRegex = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g;
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(message)) !== null) {
    result.phoneNumbers.push(phoneMatch[0]);
  }

  // Extract dates
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/g;
  let dateMatch;
  while ((dateMatch = dateRegex.exec(message)) !== null) {
    result.dates.push(dateMatch[1]);
  }

  // Extract product names (simplified implementation)
  // In a real implementation, we would use a more sophisticated approach
  // such as a product catalog or NER model
  const productPatterns = [
    /premium widget/i,
    /standard widget/i,
    /basic widget/i,
    /deluxe package/i,
    /starter kit/i,
  ];

  for (const pattern of productPatterns) {
    if (pattern.test(message)) {
      result.productNames.push(pattern.source.replace(/\/i$/, ''));
    }
  }

  return result;
}

/**
 * Determines the intent of a message
 * @param message The message to analyze
 * @returns The determined intent
 */
export function determineIntent(message: string): string {
  // Check if the message is empty
  if (!message || typeof message !== 'string') {
    return 'unknown';
  }

  // Normalize the message
  const normalizedMessage = message.trim().toLowerCase();

  // Define intent patterns
  const intentPatterns = [
    { regex: /order status|track|where is my order|when will.+arrive/i, intent: 'check_order_status' },
    { regex: /problem|issue|wrong|damaged|missing|complaint|not working/i, intent: 'report_issue' },
    { regex: /help|support|assist|how do I|how to|can you help/i, intent: 'get_help' },
    { regex: /stock|inventory|how many|available|in stock/i, intent: 'check_inventory' },
    { regex: /new product|add product|create product/i, intent: 'add_product' },
    { regex: /sales|revenue|profit|how much|how many sold/i, intent: 'check_sales' },
    { regex: /traffic|visitors|views|analytics/i, intent: 'check_traffic' },
    { regex: /update|change|modify|edit|content|website/i, intent: 'update_content' },
    { regex: /broadcast|announce|send to all|promotion|campaign/i, intent: 'send_broadcast' },
    { regex: /greeting|hello|hi|hey|good morning|good afternoon|good evening/i, intent: 'greeting' },
    { regex: /thank|thanks|appreciate|grateful/i, intent: 'gratitude' },
    { regex: /bye|goodbye|see you|talk later/i, intent: 'farewell' },
  ];

  // Check for intent matches
  for (const pattern of intentPatterns) {
    if (pattern.regex.test(normalizedMessage)) {
      return pattern.intent;
    }
  }

  // Default intent
  return 'general_query';
}

/**
 * Analyzes the sentiment of a message
 * @param message The message to analyze
 * @returns The sentiment score (-1 to 1, where -1 is very negative and 1 is very positive)
 */
export function analyzeSentiment(message: string): number {
  // This is a very simplified sentiment analysis implementation
  // In a real implementation, we would use a more sophisticated approach
  // such as a machine learning model
  
  // Check if the message is empty
  if (!message || typeof message !== 'string') {
    return 0;
  }
  
  // Normalize the message
  const normalizedMessage = message.trim().toLowerCase();
  
  // Define positive and negative word lists
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'happy', 'pleased', 'satisfied', 'love', 'like', 'thank', 'thanks',
    'helpful', 'appreciate', 'awesome', 'perfect', 'best',
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing',
    'unhappy', 'dissatisfied', 'hate', 'dislike', 'problem', 'issue',
    'wrong', 'broken', 'damaged', 'missing', 'complaint', 'worst',
    'annoying', 'frustrated', 'angry', 'upset',
  ];
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Split the message into words
  const words = normalizedMessage.split(/\s+/);
  
  // Count positive and negative words
  for (const word of words) {
    if (positiveWords.includes(word)) {
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
    }
  }
  
  // Calculate sentiment score
  const totalWords = words.length;
  if (totalWords === 0) {
    return 0;
  }
  
  return (positiveCount - negativeCount) / Math.sqrt(totalWords);
}
