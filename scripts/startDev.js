/**
 * Start Development Script
 * Starts both the server and the dev dashboard concurrently in development mode
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if we're in development mode
const mode = process.env.MODE || 'development';

if (mode !== 'development') {
  console.log(`Current mode is ${mode}. Only starting the server.`);
  // Start only the server
  const server = spawn('npm', ['run', 'dev:server'], { 
    stdio: 'inherit',
    shell: true
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
} else {
  console.log('Starting both server and dev dashboard in development mode...');
  
  // Start the server
  const server = spawn('npm', ['run', 'dev:server'], { 
    stdio: 'inherit',
    shell: true
  });
  
  // Give the server a moment to start
  setTimeout(() => {
    // Start the dev dashboard
    const dashboard = spawn('npm', ['start'], { 
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..', 'dev-dashboard')
    });
    
    dashboard.on('close', (code) => {
      console.log(`Dev dashboard process exited with code ${code}`);
      // Kill the server when the dashboard is closed
      server.kill();
    });
  }, 3000);
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    // We don't need to kill the dashboard here as it will likely be closed by the user
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Caught interrupt signal. Shutting down...');
    server.kill();
    process.exit();
  });
}
