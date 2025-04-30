/**
 * Seed Database Script
 * Seeds the MongoDB database with mock data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-server';

// Import models
const User = require('../dist/db/models/User').default;
const Order = require('../dist/db/models/Order').default;
const Message = require('../dist/db/models/Message').default;
const Inventory = require('../dist/db/models/Inventory').default;
const Issue = require('../dist/db/models/Issue').default;
const Log = require('../dist/db/models/Log').default;

// Load mock data
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'users.json'), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'inventory.json'), 'utf8'));
const orders = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'orders.json'), 'utf8'));
const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'messages.json'), 'utf8'));
const issues = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'issues.json'), 'utf8'));
const logs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mock-data', 'logs.json'), 'utf8'));

// Convert string dates to Date objects
function convertDates(obj) {
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      convertDates(obj[key]);
    } else if (typeof obj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])) {
      obj[key] = new Date(obj[key]);
    }
  }
  return obj;
}

// Seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Message.deleteMany({});
    await Inventory.deleteMany({});
    await Issue.deleteMany({});
    await Log.deleteMany({});
    console.log('Cleared existing data');

    // Seed users
    await User.insertMany(users.map(user => convertDates(user)));
    console.log(`Seeded ${users.length} users`);

    // Seed inventory
    await Inventory.insertMany(inventory.map(item => convertDates(item)));
    console.log(`Seeded ${inventory.length} inventory items`);

    // Seed orders
    await Order.insertMany(orders.map(order => convertDates(order)));
    console.log(`Seeded ${orders.length} orders`);

    // Seed messages
    await Message.insertMany(messages.map(message => convertDates(message)));
    console.log(`Seeded ${messages.length} messages`);

    // Seed issues
    await Issue.insertMany(issues.map(issue => convertDates(issue)));
    console.log(`Seeded ${issues.length} issues`);

    // Seed logs
    await Log.insertMany(logs.map(log => convertDates(log)));
    console.log(`Seeded ${logs.length} logs`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
