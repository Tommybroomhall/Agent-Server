/**
 * Services index
 * Exports all service modules for easy importing
 */

import * as whatsappService from './whatsapp';
import * as stripeService from './stripe';
import * as resendService from './resend';
import * as vercelService from './vercel';
import * as ocrService from './ocr';
import * as authService from './authService';

export {
  whatsappService,
  stripeService,
  resendService,
  vercelService,
  ocrService,
  authService
};
