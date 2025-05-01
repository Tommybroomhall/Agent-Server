/**
 * FILE: src/routes/webhookRouter.ts
 * ================================
 * WEBHOOK ROUTER
 *
 * PURPOSE:
 * Handles incoming webhooks from external services, primarily:
 * - WhatsApp API (for receiving messages from users)
 * - Stripe API (for payment and subscription events)
 *
 * This router validates incoming webhooks, processes them, and routes them to the
 * appropriate handlers. For WhatsApp messages, it determines the agent type and
 * forwards the message to the agent orchestrator.
 *
 * CONNECTIONS:
 * - Imported by src/index.ts and mounted at /webhook prefix
 * - Uses ../utils/agentOrchestrator.ts to process agent messages
 * - Uses ../services/whatsappService.ts for WhatsApp-specific functionality
 * - Uses ../services/stripeService.ts for Stripe-specific functionality
 * - Depends on ../types for AgentInput interface
 *
 * PRODUCTION BEHAVIOR:
 * 1. Receives HTTP POST requests from external services
 * 2. Validates the authenticity of webhooks using signatures
 * 3. Parses webhook payloads into structured data
 * 4. For WhatsApp: Determines agent type and processes message asynchronously
 * 5. For Stripe: Handles various payment and subscription events
 * 6. Sends responses back to external services (when applicable)
 *
 * WEBHOOK ENDPOINTS:
 * - POST /webhook/whatsapp - Receives messages from WhatsApp
 * - POST /webhook/stripe - Receives payment and subscription events from Stripe
 *
 * SECURITY NOTES:
 * - Webhook signatures MUST be validated to prevent spoofing
 * - Immediate acknowledgment of webhooks is critical to prevent retries
 * - Asynchronous processing after acknowledgment is recommended
 */

import express, { Request, Response } from 'express';
import { AgentInput } from '../types';
import { processAgentMessage } from '../utils/agentOrchestrator';
import { whatsappService, stripeService, authService } from '../services';

const router = express.Router();

/**
 * SECTION: WhatsApp Webhook Handler
 * --------------------------------
 * Processes incoming messages from WhatsApp and routes them to the appropriate agent
 */

/**
 * ENDPOINT: /webhook/whatsapp
 * --------------------------
 * Handles incoming messages from the WhatsApp Business API.
 *
 * WORKFLOW:
 * 1. Validates the webhook signature using the WhatsApp service
 * 2. Parses the webhook payload into a structured message
 * 3. Determines which agent type should handle the message
 * 4. Creates an agent input object with the message details
 * 5. Acknowledges the webhook immediately to prevent retries
 * 6. Processes the message asynchronously
 *
 * SECURITY:
 * - Uses x-hub-signature header for webhook validation
 * - Prevents processing of unauthorized webhook calls
 */
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature to ensure it's from WhatsApp
    // This is critical for security - only process authentic webhooks
    const signature = req.headers['x-hub-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!whatsappService.validateWhatsAppWebhook(signature, rawBody)) {
      res.status(401).send('Invalid signature');
      return;
    }

    // Parse the webhook payload into a structured message format
    // This extracts the relevant information from WhatsApp's format
    const whatsappMessage = whatsappService.parseWhatsAppWebhook(req.body);

    if (!whatsappMessage) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Determine which agent should handle this message based on context
    // This checks the database to see if the sender is an authorized admin or staff
    const agentType = await determineAgentType(whatsappMessage.from);

    // Create a standardized input for the agent system
    const input: AgentInput = {
      senderId: whatsappMessage.from,   // WhatsApp phone number
      message: whatsappMessage.body,    // Message text content
      mediaUrl: whatsappMessage.mediaUrl, // Optional: URL to media (image, etc.)
      timestamp: whatsappMessage.timestamp.toISOString(),
      agentType,
    };

    // IMPORTANT: Acknowledge receipt immediately to prevent WhatsApp from resending
    // WhatsApp expects a quick response (under 20 seconds)
    res.status(200).send('Webhook received');

    // Process the message asynchronously after acknowledging the webhook
    // This allows for longer processing times without timing out the webhook
    processWebhookMessage(input);
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * SECTION: Stripe Webhook Handler
 * ------------------------------
 * Processes payment and subscription events from Stripe
 */

/**
 * ENDPOINT: /webhook/stripe
 * ------------------------
 * Handles payment and subscription events from Stripe.
 *
 * WORKFLOW:
 * 1. Validates the webhook signature using the Stripe service
 * 2. Processes different event types (checkout, invoice, subscription)
 * 3. Acknowledges the webhook
 *
 * EVENT TYPES HANDLED:
 * - checkout.session.completed - When a customer completes checkout
 * - invoice.paid - When a payment is successful
 * - customer.subscription.updated - When a subscription is modified
 * - customer.subscription.deleted - When a subscription is cancelled
 *
 * SECURITY:
 * - Uses stripe-signature header for webhook validation
 * - Prevents processing of unauthorized webhook calls
 */
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature to ensure it's from Stripe
    // This prevents fraudulent payment notifications
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!stripeService.validateStripeWebhook(signature, rawBody)) {
      res.status(401).send('Invalid signature');
      return;
    }

    // Extract the event data from the webhook payload
    const event = req.body;

    // Handle different types of Stripe events
    // Each case would have more implementation in production
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout - create order, send confirmation, etc.
        console.log('Checkout completed:', event.data.object);
        break;
      case 'invoice.paid':
        // Handle successful payment - update subscription status, etc.
        console.log('Invoice paid:', event.data.object);
        break;
      case 'customer.subscription.updated':
        // Handle subscription update - change user plan, update features, etc.
        console.log('Subscription updated:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation - downgrade account, notify user, etc.
        console.log('Subscription cancelled:', event.data.object);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    // Acknowledge the webhook to prevent Stripe from retrying
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * SECTION: Helper Functions
 * -----------------------
 */

/**
 * FUNCTION: determineAgentType
 * ---------------------------
 * Determines which agent should handle a message based on sender information.
 *
 * @param sender The sender's identifier (typically a phone number)
 * @returns The determined agent type (customer, staff, or admin)
 *
 * PRODUCTION IMPLEMENTATION:
 * In production, this would:
 * 1. Query the database to find the sender's role
 * 2. Check against authorized staff/admin lists
 * 3. Use conversation context or keywords to determine role
 * 4. Default to customer agent if no other role is determined
 */
async function determineAgentType(sender: string): Promise<'customer' | 'staff' | 'admin'> {
  try {
    // Check if the sender is an authorized admin
    const isAdmin = await authService.isAuthorizedForAgentType(sender, 'admin');
    if (isAdmin) {
      return 'admin';
    }

    // Check if the sender is an authorized staff member
    const isStaff = await authService.isAuthorizedForAgentType(sender, 'staff');
    if (isStaff) {
      return 'staff';
    }

    // Default to customer agent if not admin or staff
    return 'customer';
  } catch (error) {
    console.error('Error determining agent type:', error);
    // Default to customer agent in case of error
    return 'customer';
  }
}

/**
 * FUNCTION: processWebhookMessage
 * -----------------------------
 * Asynchronously processes a message from a webhook after it's been acknowledged.
 *
 * @param input The agent input to process
 *
 * WORKFLOW:
 * 1. Processes the message through the agent orchestrator
 * 2. Handles any actions returned by the agent (WhatsApp, email, etc.)
 * 3. Logs any errors that occur during processing
 *
 * PRODUCTION BEHAVIOR:
 * - Should use a queue system for reliability (RabbitMQ, SQS, etc.)
 * - Should implement retry logic for failed processing
 * - Should update conversation state in the database
 */
async function processWebhookMessage(input: AgentInput): Promise<void> {
  try {
    // Process the message using the agent orchestrator
    // This delegates to the appropriate agent handler based on type
    const output = await processAgentMessage(input);

    // Handle any actions returned by the agent
    // These determine what external services need to be called
    if (output.actions) {
      if (output.actions.includes('whatsapp')) {
        // Send a WhatsApp message back to the user
        await whatsappService.sendWhatsAppMessage(
          input.senderId,
          output.reply
        );
      }

      if (output.actions.includes('email')) {
        // In a real implementation, this would send an email via a service
        // For now, it's just logged for demonstration
        console.log(`[Email Action] Would send email to user related to ${input.senderId}`);
      }
    }
  } catch (error) {
    // Log the error for monitoring and debugging
    // In production, this should send alerts for critical errors
    console.error('Error processing webhook message:', error);
  }
}

export { router as webhookRouter };
