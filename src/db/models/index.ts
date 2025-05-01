/**
 * FILE: src/db/models/index.ts
 * ==========================
 * DATABASE MODELS INDEX
 * 
 * PURPOSE:
 * Centralizes all database model exports in a single file to simplify imports
 * throughout the application and provide a clean interface to the data layer.
 * 
 * CONNECTIONS:
 * - Imported by services and agent handlers that need database access
 * - Connects all model files to the rest of the application
 * - Simplifies import statements throughout the codebase
 * 
 * PRODUCTION BEHAVIOR:
 * 1. Provides a single entry point for accessing all database models
 * 2. Enables importing multiple models with a single import statement
 * 3. Creates a layer of abstraction between model implementation and usage
 * 
 * USAGE PATTERN:
 * ```
 * import { User, Order, Message } from '../db/models';
 * ```
 */

import User from './User';
import Order from './Order';
import Message from './Message';
import Inventory from './Inventory';
import Issue from './Issue';
import Log from './Log';
import Admin from './Admin';
import Staff from './Staff';
import AuthorizedNumber from './AuthorizedNumber';

export {
  User,
  Order,
  Message,
  Inventory,
  Issue,
  Log,
  Admin,
  Staff,
  AuthorizedNumber
};
