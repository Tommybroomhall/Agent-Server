/**
 * Generate Mock Data Script
 * Creates mock data for testing the agent server
 */

const fs = require('fs');
const path = require('path');

// Mock users
const users = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    businessName: 'John\'s Widgets',
    planLevel: 'premium',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    businessName: 'Jane\'s Gadgets',
    planLevel: 'basic',
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2023-02-01'),
  },
];

// Mock inventory
const inventory = [
  {
    _id: '60d21b4667d0d8992e610c87',
    productId: 'PROD001',
    name: 'Premium Widget',
    description: 'Our top-of-the-line widget with all the bells and whistles.',
    price: 49.99,
    stockLevel: 15,
    category: 'Widgets',
    imageUrl: 'https://example.com/images/premium-widget.jpg',
    sku: 'PW001',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    productId: 'PROD002',
    name: 'Standard Widget',
    description: 'A reliable widget for everyday use.',
    price: 29.99,
    stockLevel: 27,
    category: 'Widgets',
    imageUrl: 'https://example.com/images/standard-widget.jpg',
    sku: 'SW001',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    productId: 'PROD003',
    name: 'Basic Widget',
    description: 'An affordable widget for those on a budget.',
    price: 19.99,
    stockLevel: 42,
    category: 'Widgets',
    imageUrl: 'https://example.com/images/basic-widget.jpg',
    sku: 'BW001',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c8a',
    productId: 'PROD004',
    name: 'Deluxe Package',
    description: 'A complete set of widgets for the discerning customer.',
    price: 99.99,
    stockLevel: 8,
    category: 'Packages',
    imageUrl: 'https://example.com/images/deluxe-package.jpg',
    sku: 'DP001',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c8b',
    productId: 'PROD005',
    name: 'Starter Kit',
    description: 'Everything you need to get started with widgets.',
    price: 79.99,
    stockLevel: 12,
    category: 'Packages',
    imageUrl: 'https://example.com/images/starter-kit.jpg',
    sku: 'SK001',
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
];

// Mock orders
const orders = [
  {
    _id: '60d21b4667d0d8992e610c8c',
    orderId: 'ORD12345',
    customerId: '60d21b4667d0d8992e610c85',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    status: 'delivered',
    items: [
      {
        productId: '60d21b4667d0d8992e610c87',
        name: 'Premium Widget',
        quantity: 1,
        price: 49.99,
      },
      {
        productId: '60d21b4667d0d8992e610c88',
        name: 'Standard Widget',
        quantity: 2,
        price: 29.99,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    totalAmount: 109.97,
    paymentStatus: 'paid',
    trackingNumber: 'TRK123456',
    notes: 'Customer requested gift wrapping.',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-20'),
  },
  {
    _id: '60d21b4667d0d8992e610c8d',
    orderId: 'ORD12346',
    customerId: '60d21b4667d0d8992e610c85',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    status: 'processing',
    items: [
      {
        productId: '60d21b4667d0d8992e610c8a',
        name: 'Deluxe Package',
        quantity: 1,
        price: 99.99,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    totalAmount: 99.99,
    paymentStatus: 'paid',
    notes: '',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01'),
  },
  {
    _id: '60d21b4667d0d8992e610c8e',
    orderId: 'ORD12347',
    customerId: '60d21b4667d0d8992e610c86',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1987654321',
    status: 'pending',
    items: [
      {
        productId: '60d21b4667d0d8992e610c87',
        name: 'Premium Widget',
        quantity: 3,
        price: 49.99,
      },
    ],
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      postalCode: '67890',
      country: 'USA',
    },
    totalAmount: 149.97,
    paymentStatus: 'pending',
    notes: '',
    createdAt: new Date('2023-06-02'),
    updatedAt: new Date('2023-06-02'),
  },
];

// Mock messages
const messages = [
  {
    _id: '60d21b4667d0d8992e610c8f',
    senderId: '+1234567890',
    receiverId: 'system',
    content: 'What\'s the status of my order?',
    direction: 'inbound',
    agentType: 'customer',
    timestamp: new Date('2023-06-05T10:30:00'),
    metadata: {
      intent: 'check_order_status',
    },
    createdAt: new Date('2023-06-05T10:30:00'),
    updatedAt: new Date('2023-06-05T10:30:00'),
  },
  {
    _id: '60d21b4667d0d8992e610c90',
    senderId: 'system',
    receiverId: '+1234567890',
    content: 'Your order #ORD12346 is currently being processed. It should ship within the next 1-2 business days.',
    direction: 'outbound',
    agentType: 'customer',
    timestamp: new Date('2023-06-05T10:30:05'),
    createdAt: new Date('2023-06-05T10:30:05'),
    updatedAt: new Date('2023-06-05T10:30:05'),
  },
  {
    _id: '60d21b4667d0d8992e610c91',
    senderId: '+1987654321',
    receiverId: 'system',
    content: 'I need to update the inventory for Premium Widgets. We just received 10 more units.',
    direction: 'inbound',
    agentType: 'staff',
    timestamp: new Date('2023-06-06T09:15:00'),
    metadata: {
      intent: 'update_inventory',
    },
    createdAt: new Date('2023-06-06T09:15:00'),
    updatedAt: new Date('2023-06-06T09:15:00'),
  },
  {
    _id: '60d21b4667d0d8992e610c92',
    senderId: 'system',
    receiverId: '+1987654321',
    content: 'I\'ve updated the inventory for Premium Widgets. The new stock level is 25 units.',
    direction: 'outbound',
    agentType: 'staff',
    timestamp: new Date('2023-06-06T09:15:05'),
    createdAt: new Date('2023-06-06T09:15:05'),
    updatedAt: new Date('2023-06-06T09:15:05'),
  },
];

// Mock issues
const issues = [
  {
    _id: '60d21b4667d0d8992e610c93',
    issueId: 'ISS001',
    orderId: '60d21b4667d0d8992e610c8c',
    customerId: '60d21b4667d0d8992e610c85',
    type: 'delivery',
    status: 'resolved',
    priority: 'high',
    description: 'Package was delivered to the wrong address.',
    assignedTo: 'staff1',
    resolution: 'Contacted the delivery service and had the package redirected to the correct address.',
    createdAt: new Date('2023-05-25'),
    updatedAt: new Date('2023-05-27'),
    resolvedAt: new Date('2023-05-27'),
  },
  {
    _id: '60d21b4667d0d8992e610c94',
    issueId: 'ISS002',
    orderId: '60d21b4667d0d8992e610c8d',
    customerId: '60d21b4667d0d8992e610c85',
    type: 'product',
    status: 'open',
    priority: 'medium',
    description: 'One of the widgets in the Deluxe Package is missing.',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05'),
  },
];

// Mock logs
const logs = [
  {
    _id: '60d21b4667d0d8992e610c95',
    agentType: 'customer',
    action: 'message_received',
    userId: '60d21b4667d0d8992e610c85',
    details: {
      senderId: '+1234567890',
      message: 'What\'s the status of my order?',
      timestamp: new Date('2023-06-05T10:30:00'),
    },
    timestamp: new Date('2023-06-05T10:30:00'),
    createdAt: new Date('2023-06-05T10:30:00'),
    updatedAt: new Date('2023-06-05T10:30:00'),
  },
  {
    _id: '60d21b4667d0d8992e610c96',
    agentType: 'customer',
    action: 'order_status_checked',
    userId: '60d21b4667d0d8992e610c85',
    orderId: '60d21b4667d0d8992e610c8d',
    details: {
      orderId: 'ORD12346',
      status: 'processing',
      timestamp: new Date('2023-06-05T10:30:05'),
    },
    timestamp: new Date('2023-06-05T10:30:05'),
    createdAt: new Date('2023-06-05T10:30:05'),
    updatedAt: new Date('2023-06-05T10:30:05'),
  },
  {
    _id: '60d21b4667d0d8992e610c97',
    agentType: 'staff',
    action: 'inventory_updated',
    details: {
      productId: 'PROD001',
      oldStockLevel: 15,
      newStockLevel: 25,
      timestamp: new Date('2023-06-06T09:15:05'),
    },
    timestamp: new Date('2023-06-06T09:15:05'),
    createdAt: new Date('2023-06-06T09:15:05'),
    updatedAt: new Date('2023-06-06T09:15:05'),
  },
];

// Create the mock data directory if it doesn't exist
const mockDataDir = path.join(__dirname, '..', 'mock-data');
if (!fs.existsSync(mockDataDir)) {
  fs.mkdirSync(mockDataDir);
}

// Write the mock data to JSON files
fs.writeFileSync(path.join(mockDataDir, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(mockDataDir, 'inventory.json'), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(mockDataDir, 'orders.json'), JSON.stringify(orders, null, 2));
fs.writeFileSync(path.join(mockDataDir, 'messages.json'), JSON.stringify(messages, null, 2));
fs.writeFileSync(path.join(mockDataDir, 'issues.json'), JSON.stringify(issues, null, 2));
fs.writeFileSync(path.join(mockDataDir, 'logs.json'), JSON.stringify(logs, null, 2));

console.log('Mock data generated successfully!');
