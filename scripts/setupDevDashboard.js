/**
 * Setup Dev Dashboard Script
 * Installs dependencies for the dev dashboard
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Dev dashboard directory
const devDashboardDir = path.join(__dirname, '..', 'dev-dashboard');

// Check if the dev dashboard directory exists
if (!fs.existsSync(devDashboardDir)) {
  console.error('Dev dashboard directory does not exist!');
  process.exit(1);
}

// Check if package.json exists
if (!fs.existsSync(path.join(devDashboardDir, 'package.json'))) {
  console.error('Dev dashboard package.json does not exist!');
  process.exit(1);
}

try {
  // Change to the dev dashboard directory
  process.chdir(devDashboardDir);
  console.log('Changed to dev dashboard directory');

  // Install dependencies
  console.log('Installing dev dashboard dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('Dev dashboard setup completed successfully!');
} catch (error) {
  console.error('Error setting up dev dashboard:', error.message);
  process.exit(1);
}
