/**
 * Create Directories Script
 * Creates the necessary directories for the project
 */

const fs = require('fs');
const path = require('path');

// Directories to create
const directories = [
  'src',
  'src/agents',
  'src/routes',
  'src/services',
  'src/db',
  'src/db/models',
  'src/utils',
  'src/types',
  'dev-dashboard',
  'dev-dashboard/components',
  'dev-dashboard/chatMocks',
  'mock-data',
  'scripts',
  'dist',
];

// Create directories
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All directories created successfully!');
