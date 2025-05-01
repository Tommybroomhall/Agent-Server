# WhatsApp-Based AI Business Assistant

A dashboard-free, WhatsApp-native AI system that empowers small business owners to manage and automate their entire store operation using natural language and image input.

## Overview

This system provides three distinct AI agents through WhatsApp:

1. **Customer Agent** - Handles customer queries, order statuses, and issue reporting
2. **Staff Agent** - Manages inventory updates, sends packaging confirmations, and logs stock changes
3. **Admin Agent** - Provides real-time business metrics, sales data, and allows content updates or campaign triggers

## Core Architecture

- **Agent Server (Node.js with Express)**: Routes incoming messages to the appropriate agent module
- **MongoDB (Atlas)**: Core data store for all user, order, inventory, and message data
- **Stripe API**: Tracks subscriptions and order payments
- **Vercel API**: Enables content and layout updates via frontend deployment hooks
- **Resend API**: Handles transactional and broadcast emails
- **OCR Layer**: Extracts text from order label images
- **LLM Agent Layer**: Role-specific prompt wrappers with access to context data and API integrations
- **Testing Dashboard**: Simulates chat windows for each agent role during development

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/whatsapp-ai-business-assistant.git
   cd whatsapp-ai-business-assistant
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API keys and configuration

   The `MODE` environment variable controls whether the dashboard starts automatically:
   - `MODE=development` (default): Both server and dashboard start with `npm run dev`
   - `MODE=production`: Only the server starts with `npm run dev`

5. Set up the project (creates directories, builds TypeScript, generates mock data, and seeds the database)

   ```bash
   npm run setup-all
   ```

6. Start the development server and dashboard concurrently

   ```bash
   npm run dev
   ```

   This will automatically start both the server and the development dashboard in development mode.

## Development

### Available Scripts

The project includes several npm scripts to help with development:

- `npm run dev` - Start both the server and dashboard concurrently (development mode only)
- `npm run dev:server` - Start only the server with hot reloading
- `npm run build` - Build the TypeScript code
- `npm run start` - Start the production server
- `npm run create-dirs` - Create the necessary directories
- `npm run generate-mock-data` - Generate mock data for testing
- `npm run seed-database` - Seed the database with mock data
- `npm run setup` - Run create-dirs, build, generate-mock-data, and seed-database
- `npm run setup-dashboard` - Set up the development dashboard
- `npm run setup-all` - Run setup and setup-dashboard
- `npm run test-agent` - Test the agent server with sample messages
- `npm run start:concurrent` - Alternative way to start both server and dashboard
- `npm run create-admin` - Create an initial admin user with full system access

### Directory Structure

```plaintext
/src
  /agents              # Each agent has its logic here
    customerAgent.ts
    staffAgent.ts
    adminAgent.ts
  /routes              # Express routes
    agentRouter.ts
    webhookRouter.ts
  /services            # Third-party integrations
    whatsapp.ts
    stripe.ts
    resend.ts
    vercel.ts
    ocr.ts
    authService.ts
  /db
    connect.ts
    /models
      User.ts
      Order.ts
      Message.ts
      Inventory.ts
      Issue.ts
      Log.ts
      Admin.ts
      Staff.ts
      AuthorizedNumber.ts
  /utils
    messageParser.ts
    promptBuilder.ts
    agentOrchestrator.ts
  /types               # Shared TS types/interfaces
  index.ts             # Main server entrypoint
/dev-dashboard         # React-based local UI simulator
  /components
  /chatMocks
  App.tsx
/scripts               # Utility scripts
  createDirectories.js
  generateMockData.js
  seedDatabase.js
  testAgent.js
  setupDevDashboard.js
  createInitialAdmin.js
/mock-data             # Generated mock data for testing
```

### Agent Logic

Each agent exports a handler like:

```typescript
export async function handleCustomerMessage(input: AgentInput): Promise<AgentOutput> { /* logic */ }
```

The agent orchestrator processes messages and routes them to the appropriate agent based on the agent type.

### Types

```typescript
export interface AgentInput {
  senderId: string;
  message: string;
  mediaUrl?: string;
  timestamp: string;
  agentType: 'customer' | 'staff' | 'admin';
}

export interface AgentOutput {
  reply: string;
  actions?: ('email' | 'whatsapp')[];
}
```

### Testing

You can test the agent server using the development dashboard or the test script:

```bash
# Test using the script
npm run test-agent

# Test using the dashboard (starts both server and dashboard)
npm run dev
```

### Mock Data

The project includes scripts to generate and seed mock data for testing:

```bash
# Generate mock data
npm run generate-mock-data

# Seed the database with mock data
npm run seed-database
```

### Admin and Staff Management

The system includes secure access control for admin and staff users:

**Creating an initial admin user:**

```bash
# Build the project first if you haven't already
npm run build

# Create the admin user
npm run create-admin
```

**Admin capabilities:**

- Add staff members: `Add staff: John Doe, john@example.com, +1234567890, inventory`
- List all staff: `List all staff`
- Remove staff: `Remove staff: +1234567890`
- Activate/deactivate staff: `Activate staff: +1234567890` or `Deactivate staff: +1234567890`

**Security features:**

- Only registered phone numbers can access staff and admin agents
- Customer agent is open to all phone numbers
- All admin and staff passwords are securely hashed
- Phone numbers are normalized for consistent lookup

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Features

- **Three AI Agents**: Customer, Staff, and Admin agents with specific roles
- **WhatsApp Integration**: Process messages from WhatsApp Business API
- **MongoDB Database**: Store and retrieve data from MongoDB
- **OCR Processing**: Extract text from images using OCR
- **Stripe Integration**: Handle payments and subscriptions
- **Email Integration**: Send transactional and broadcast emails
- **Content Management**: Update website content via Vercel API
- **Development Dashboard**: Test agent interactions without WhatsApp
- **Environment-Aware Execution**: Automatically adjusts behavior based on MODE (development/production)
- **Admin and Staff Management**: Secure access control with admin-managed staff accounts
- **Phone Number Authorization**: Only registered numbers can access staff and admin agents

## Roadmap

- [ ] Implement real WhatsApp Business API integration
- [x] Add authentication and authorization for admin and staff access
- [ ] Enhance OCR capabilities for better label recognition
- [ ] Implement more sophisticated agent logic
- [ ] Add unit and integration tests
- [ ] Deploy to production environment
- [ ] Add monitoring and logging

## Acknowledgments

- OpenAI for the LLM capabilities
- Tesseract.js for OCR functionality
- MongoDB for database services
- Express for the server framework
- React for the development dashboard
