/**
 * Webhook Router
 * Handles incoming webhooks from external services
 */

import express, { Request, Response } from 'express';
import { AgentInput } from '../types';
import { processAgentMessage } from '../utils/agentOrchestrator';
import { whatsappService, stripeService } from '../services';

const router = express.Router();

/**
 * WhatsApp webhook endpoint
 * Handles incoming messages from WhatsApp
 */
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature
    const signature = req.headers['x-hub-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!whatsappService.validateWhatsAppWebhook(signature, rawBody)) {
      res.status(401).send('Invalid signature');
      return;
    }

    // Parse the webhook payload
    const whatsappMessage = whatsappService.parseWhatsAppWebhook(req.body);

    if (!whatsappMessage) {
      res.status(400).send('Invalid webhook payload');
      return;
    }

    // Determine the agent type based on the sender's number or context
    const agentType = determineAgentType(whatsappMessage.from);

    // Create the agent input
    const input: AgentInput = {
      senderId: whatsappMessage.from,
      message: whatsappMessage.body,
      mediaUrl: whatsappMessage.mediaUrl,
      timestamp: whatsappMessage.timestamp.toISOString(),
      agentType,
    };

    // Acknowledge the webhook immediately
    res.status(200).send('Webhook received');

    // Process the message asynchronously
    processWebhookMessage(input);
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Stripe webhook endpoint
 * Handles payment and subscription events from Stripe
 */
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (!stripeService.validateStripeWebhook(signature, rawBody)) {
      res.status(401).send('Invalid signature');
      return;
    }

    // Process the Stripe event
    const event = req.body;

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful checkout
        console.log('Checkout completed:', event.data.object);
        break;
      case 'invoice.paid':
        // Handle successful payment
        console.log('Invoice paid:', event.data.object);
        break;
      case 'customer.subscription.updated':
        // Handle subscription update
        console.log('Subscription updated:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        console.log('Subscription cancelled:', event.data.object);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    // Acknowledge the webhook
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Determines the agent type based on the sender's information
 * @param sender The sender's identifier
 * @returns The determined agent type
 */
function determineAgentType(sender: string): 'customer' | 'staff' | 'admin' {
  // This is a placeholder implementation
  // In a real implementation, we would look up the sender in our database

  // For demo purposes, we'll use a simple pattern matching
  if (sender.includes('admin')) {
    return 'admin';
  } else if (sender.includes('staff')) {
    return 'staff';
  } else {
    return 'customer';
  }
}

/**
 * Processes a webhook message asynchronously
 * @param input The agent input to process
 */
async function processWebhookMessage(input: AgentInput): Promise<void> {
  try {
    // Process the message using the agent orchestrator
    const output = await processAgentMessage(input);

    // Handle any actions returned by the agent
    if (output.actions) {
      if (output.actions.includes('whatsapp')) {
        // Send a WhatsApp message
        await whatsappService.sendWhatsAppMessage(
          input.senderId,
          output.reply
        );
      }

      if (output.actions.includes('email')) {
        // In a real implementation, we would send an email
        console.log(`[Email Action] Would send email to user related to ${input.senderId}`);
      }
    }
  } catch (error) {
    console.error('Error processing webhook message:', error);
  }
}

export { router as webhookRouter };
