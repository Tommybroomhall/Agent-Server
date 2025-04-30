/**
 * Test Agent Script
 * Tests the agent server by sending sample messages to each agent
 */

const axios = require('axios');

// Server URL
const SERVER_URL = 'http://localhost:3001';

// Sample messages for each agent
const sampleMessages = {
  customer: [
    'What\'s the status of my order?',
    'I have a problem with my order',
    'Do you have Premium Widgets in stock?',
    'How long will shipping take?',
    'Can I return an item?',
  ],
  staff: [
    'I need to update the inventory for Premium Widgets. We just received 10 more units.',
    'Order #ORD12346 has been shipped. Tracking number is TRK654321.',
    'We\'re out of Standard Widgets. Please update the stock level to 0.',
    'New product: Ultra Widget, price $59.99, SKU UW001, category Widgets, stock 5.',
    'Customer John Doe called about order #ORD12346. They want to add gift wrapping.',
  ],
  admin: [
    'Show me sales for this week',
    'What\'s our website traffic like today?',
    'Update the homepage to show our new promotion',
    'Send a broadcast message to all customers about our sale',
    'How many Premium Widgets have we sold this month?',
  ],
};

// Test a specific agent
async function testAgent(agentType, message) {
  try {
    console.log(`\nTesting ${agentType} agent with message: "${message}"`);
    
    const response = await axios.post(`${SERVER_URL}/agent/${agentType}`, {
      senderId: `test-${agentType}-user`,
      message,
      timestamp: new Date().toISOString(),
    });
    
    if (response.data.success) {
      console.log('Agent response:', response.data.data.reply);
      
      if (response.data.data.actions && response.data.data.actions.length > 0) {
        console.log('Actions:', response.data.data.actions);
      }
    } else {
      console.error('Error:', response.data.message);
    }
  } catch (error) {
    console.error('Error testing agent:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Test all agents with all sample messages
async function testAllAgents() {
  for (const [agentType, messages] of Object.entries(sampleMessages)) {
    for (const message of messages) {
      await testAgent(agentType, message);
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Run the tests
console.log('Starting agent tests...');
testAllAgents().then(() => {
  console.log('\nAgent tests completed!');
});
