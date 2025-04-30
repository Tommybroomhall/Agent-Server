**Title: WhatsApp-Based AI Business Assistant - System Overview and Architecture**
## Vision
A dashboard-free, WhatsApp-native AI system that empowers small business owners to manage and automate their entire store operation using natural language and image input. The system provides three distinct AI agents through WhatsApp:
1. **Customer Agent** - Handles customer queries, order statuses, and issue reporting
2. **Staff Agent** - Manages inventory updates, sends packaging confirmations, and logs stock changes
3. **Admin Agent** - Provides real-time business metrics, sales data, and allows content updates or campaign triggers

## Core Architecture
### System Components
- **Agent Server (Node.js with Express or Fastify)**: Routes incoming messages to the appropriate agent module
- **MongoDB (Atlas)**: Core data store for all user, order, inventory, and message data
- **Stripe API**: Tracks subscriptions and order payments
- **Vercel API**: Enables content and layout updates via frontend deployment hooks
- **Resend API**: Handles transactional and broadcast emails
- **OCR Layer**: Extracts text from order label images using Tesseract.js or Vision API
- **LLM Agent Layer**: Role-specific prompt wrappers with access to context data and API integrations
- **Testing Dashboard**: Simulates chat windows for each agent role during development (no WhatsApp required for v0.1)

## Agent Roles
### 1. Customer Agent
- Receives inbound customer messages
- Retrieves order info using phone/email/order ID
- Answers delivery/product queries
- Escalates delivery issues to Staff Agent via internal notification
- Sends order confirmation or update messages through WhatsApp and email

### 2. Staff Agent
- Receives package label images
- Runs OCR to extract customer/address info
- Matches to order and triggers shipping notification
- Accepts `stock take` and `new product` messages
- Logs packaging completion or order status changes

### 3. Admin Agent
- Responds to business insight requests (e.g. "sales this week", "traffic today")
- Pulls analytics from Stripe and Vercel
- Accepts frontend update instructions (e.g. homepage copy)
- Broadcasts promotions or service alerts to customers or staff

## Data Flow (Example: StaffAgent Order Update)
1. Staff sends product label image to StaffAgent WhatsApp
2. OCR extracts address or order ID
3. MongoDB and Stripe are queried for matching order
4. If found, update order status and log shipment
5. CustomerAgent notifies customer via WhatsApp and Resend

## MongoDB Collections
- `users`: business identity, contact info, plan level
- `orders`: order metadata (customer, status, shipping)
- `messages`: structured chat logs with type and direction
- `inventory`: stock levels, product metadata
- `issues`: open complaints or manual resolutions
- `logs`: agent actions, command history, audit trails
- `notifications`: cross-agent alerts, escalations

## JavaScript Stack Recommendations
- **Framework**: [Fastify](https://fastify.dev/) or [Express](https://expressjs.com/) for server routing
- **Database**: [Mongoose](https://mongoosejs.com/) for ODM with MongoDB Atlas
- **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js) for browser-compatible image parsing
- **AI Layer**: Custom LLM wrappers via OpenAI SDK with system prompts
- **Frontend Simulator**: Basic React app to test agent flows without WhatsApp

#### Directory Structure
/src
  /agents
    customerAgent.ts
    staffAgent.ts
    adminAgent.ts
  /routes
    webhookRouter.ts
    agentRouter.ts
  /services
    whatsapp.ts
    stripe.ts
    resend.ts
    vercel.ts
    ocr.ts
  /utils
    messageParser.ts
    dbConnect.ts
  /db
    models/
      Orders.ts
      Users.ts
      Inventory.ts
      Issues.ts
      Messages.ts
      Logs.ts

## MVP Goals (First Milestone)
1. Express/Fastify server with hot reload
2. MongoDB schemas + connection config
3. `/agent/customer`, `/agent/staff`, `/agent/admin` endpoints
4. Test-only frontend with 3 chat windows (React)
5. Fake data matching for label image flow
6. Console-based agent responses (pre-WhatsApp)

## Agent Communication Framework
- Agents read/write shared logs
- Notifications stored in a collection for hand-offs
- Prompts are scoped per agent and reference role-based memory
- Inter-agent triggers allow seamless escalations (e.g. order issue from Customer → Staff)

## Build Plan (Code Generation Agents)
- File scaffolding: `/src/routes`, `/src/agents`, `/src/utils`
- MongoDB model setup and schema files
- Route handling: `/agent/*` endpoints
- Agent orchestration logic (processAgentMessage.ts)
- OCR integration module stub

- Frontend dashboard: `React` app with switchable agent chat window
- Message simulator and dummy order injection
- Chat state management (per agent role)
- Developer control panel to test escalation flow and logs
- Mock response visualiser and debugging overlay

## Next
- [ ] Finalize project structure + dev dashboard wireframe
- [ ] Build MongoDB models
- [ ] Create mock JSON payloads for testing
- [ ] Start implementing StaffAgent image pipeline + logging
- [ ] Begin CustomerAgent response template logic
- [ ] Define dev-only mock WhatsApp interface in React