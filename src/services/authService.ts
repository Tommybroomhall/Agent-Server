/**
 * Auth Service
 * Handles authentication and authorization for the system
 */

import { AuthorizedNumber, Admin, Staff } from '../db/models';
import { AgentType } from '../types';

/**
 * Checks if a phone number is authorized for a specific agent type
 * @param phone The phone number to check
 * @param agentType The agent type to check authorization for
 * @returns A promise that resolves to true if authorized, false otherwise
 */
export async function isAuthorizedForAgentType(
  phone: string,
  agentType: AgentType
): Promise<boolean> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // For customer agent, all numbers are allowed
    if (agentType === 'customer') {
      return true;
    }
    
    // For staff and admin agents, check if the number is authorized
    const authorizedNumber = await AuthorizedNumber.findOne({
      phone: normalizedPhone,
      userType: agentType,
      isActive: true
    });
    
    return !!authorizedNumber;
  } catch (error) {
    console.error(`Error checking authorization for ${phone}:`, error);
    return false;
  }
}

/**
 * Gets the user ID associated with a phone number
 * @param phone The phone number to check
 * @param userType The user type to check
 * @returns A promise that resolves to the user ID if found, null otherwise
 */
export async function getUserIdFromPhone(
  phone: string,
  userType: 'admin' | 'staff' | 'customer'
): Promise<string | null> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    const authorizedNumber = await AuthorizedNumber.findOne({
      phone: normalizedPhone,
      userType,
      isActive: true
    });
    
    return authorizedNumber?.userId?.toString() || null;
  } catch (error) {
    console.error(`Error getting user ID for ${phone}:`, error);
    return null;
  }
}

/**
 * Adds a new authorized number
 * @param phone The phone number to authorize
 * @param userType The user type to authorize for
 * @param userId The ID of the user to associate with the number
 * @returns A promise that resolves to the created authorized number
 */
export async function addAuthorizedNumber(
  phone: string,
  userType: 'admin' | 'staff' | 'customer',
  userId?: string
): Promise<any> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Check if the number is already authorized
    const existingNumber = await AuthorizedNumber.findOne({
      phone: normalizedPhone
    });
    
    if (existingNumber) {
      throw new Error(`Phone number ${phone} is already authorized`);
    }
    
    // Create a new authorized number
    const authorizedNumber = await AuthorizedNumber.create({
      phone: normalizedPhone,
      userType,
      userId,
      isActive: true
    });
    
    return authorizedNumber;
  } catch (error) {
    console.error(`Error adding authorized number ${phone}:`, error);
    throw error;
  }
}

/**
 * Removes an authorized number
 * @param phone The phone number to remove authorization for
 * @returns A promise that resolves to true if successful, false otherwise
 */
export async function removeAuthorizedNumber(
  phone: string
): Promise<boolean> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Remove the authorized number
    const result = await AuthorizedNumber.deleteOne({
      phone: normalizedPhone
    });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error removing authorized number ${phone}:`, error);
    return false;
  }
}

/**
 * Updates an authorized number's status
 * @param phone The phone number to update
 * @param isActive The new active status
 * @returns A promise that resolves to true if successful, false otherwise
 */
export async function updateAuthorizedNumberStatus(
  phone: string,
  isActive: boolean
): Promise<boolean> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Update the authorized number
    const result = await AuthorizedNumber.updateOne(
      { phone: normalizedPhone },
      { isActive }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error updating authorized number ${phone}:`, error);
    return false;
  }
}

/**
 * Creates a new admin user
 * @param adminData The admin data to create
 * @returns A promise that resolves to the created admin
 */
export async function createAdmin(adminData: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<any> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(adminData.phone);
    
    // Create the admin
    const admin = await Admin.create({
      ...adminData,
      phone: normalizedPhone
    });
    
    // Add the admin's phone number to authorized numbers
    await addAuthorizedNumber(normalizedPhone, 'admin', admin._id);
    
    return admin;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

/**
 * Creates a new staff user
 * @param staffData The staff data to create
 * @param createdBy The ID of the admin creating the staff
 * @returns A promise that resolves to the created staff
 */
export async function createStaff(
  staffData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'inventory' | 'customer-service' | 'shipping' | 'general';
    permissions?: string[];
  },
  createdBy: string
): Promise<any> {
  try {
    // Normalize the phone number
    const normalizedPhone = normalizePhoneNumber(staffData.phone);
    
    // Create the staff
    const staff = await Staff.create({
      ...staffData,
      phone: normalizedPhone,
      createdBy
    });
    
    // Add the staff's phone number to authorized numbers
    await addAuthorizedNumber(normalizedPhone, 'staff', staff._id);
    
    return staff;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
}

/**
 * Updates a staff user's status
 * @param staffId The ID of the staff to update
 * @param isActive The new active status
 * @returns A promise that resolves to true if successful, false otherwise
 */
export async function updateStaffStatus(
  staffId: string,
  isActive: boolean
): Promise<boolean> {
  try {
    // Update the staff
    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { isActive },
      { new: true }
    );
    
    if (!staff) {
      return false;
    }
    
    // Update the authorized number status
    await updateAuthorizedNumberStatus(staff.phone, isActive);
    
    return true;
  } catch (error) {
    console.error(`Error updating staff status ${staffId}:`, error);
    return false;
  }
}

/**
 * Gets all staff members
 * @param filter Optional filter criteria
 * @returns A promise that resolves to an array of staff members
 */
export async function getAllStaff(filter: any = {}): Promise<any[]> {
  try {
    return await Staff.find(filter).select('-password');
  } catch (error) {
    console.error('Error getting all staff:', error);
    return [];
  }
}

/**
 * Gets a staff member by ID
 * @param staffId The ID of the staff to get
 * @returns A promise that resolves to the staff member if found, null otherwise
 */
export async function getStaffById(staffId: string): Promise<any> {
  try {
    return await Staff.findById(staffId).select('-password');
  } catch (error) {
    console.error(`Error getting staff ${staffId}:`, error);
    return null;
  }
}

/**
 * Normalizes a phone number by removing non-numeric characters
 * and ensuring it starts with a + if it doesn't already
 * @param phone The phone number to normalize
 * @returns The normalized phone number
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters except +
  let normalized = phone.replace(/[^0-9+]/g, '');
  
  // Ensure the number starts with +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}
