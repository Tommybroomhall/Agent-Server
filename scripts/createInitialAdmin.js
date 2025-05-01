/**
 * Create Initial Admin Script
 * Creates the first admin user in the system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-server';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to normalize phone number
function normalizePhoneNumber(phone) {
  // Remove all non-numeric characters except +
  let normalized = phone.replace(/[^0-9+]/g, '');
  
  // Ensure the number starts with +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

// Main function
async function createInitialAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import models
    const Admin = require('../dist/db/models/Admin').default;
    const AuthorizedNumber = require('../dist/db/models/AuthorizedNumber').default;

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('An admin user already exists in the system.');
      const proceed = await prompt('Do you want to create another admin? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Operation cancelled.');
        rl.close();
        await mongoose.disconnect();
        return;
      }
    }

    // Get admin details
    console.log('\nPlease provide details for the new admin user:');
    const name = await prompt('Name: ');
    const email = await prompt('Email: ');
    let phone = await prompt('Phone (with country code, e.g., +1234567890): ');
    const password = await prompt('Password: ');

    // Normalize phone number
    phone = normalizePhoneNumber(phone);

    // Check if phone is already authorized
    const existingAuthorizedNumber = await AuthorizedNumber.findOne({ phone });
    if (existingAuthorizedNumber) {
      console.log(`Phone number ${phone} is already authorized in the system.`);
      rl.close();
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      phone,
      password: hashedPassword,
      isActive: true
    });

    // Add admin's phone to authorized numbers
    await AuthorizedNumber.create({
      phone,
      userType: 'admin',
      userId: admin._id,
      isActive: true
    });

    console.log(`\nAdmin user created successfully!
Name: ${admin.name}
Email: ${admin.email}
Phone: ${admin.phone}
ID: ${admin._id}
`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close readline interface and disconnect from MongoDB
    rl.close();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createInitialAdmin();
