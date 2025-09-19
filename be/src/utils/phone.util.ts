/**
 * Utility functions for phone number formatting
 */
export class PhoneUtil {
  /**
   * Convert Vietnamese phone number from 0xxx format to +84xxx format
   * @param phoneNumber - Phone number in 0xxx format
   * @returns Phone number in +84xxx format
   */
  static formatVietnamesePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) {
      return phoneNumber;
    }

    // Remove all whitespace and special characters except + and numbers
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // If already starts with +84, return as is
    if (cleanPhone.startsWith('+84')) {
      return cleanPhone;
    }

    // If starts with 84, add + prefix
    if (cleanPhone.startsWith('84')) {
      return '+' + cleanPhone;
    }

    // If starts with 0, replace with +84
    if (cleanPhone.startsWith('0')) {
      return '+84' + cleanPhone.substring(1);
    }

    // If doesn't start with 0 or +84, assume it's a Vietnamese number without country code
    // Add +84 prefix
    return '+84' + cleanPhone;
  }

  /**
   * Validate Vietnamese phone number format
   * @param phoneNumber - Phone number to validate
   * @returns boolean indicating if the phone number is valid
   */
  static isValidVietnamesePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) {
      return false;
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Vietnamese phone number patterns:
    // Mobile: 03x, 05x, 07x, 08x, 09x (10 digits starting with 0)
    // Or +84{3,5,7,8,9}xxxxxxx (12 digits starting with +84)
    
    // Check for 0xxxxxxxxx format (10 digits)
    if (cleanPhone.match(/^0[3-9]\d{8}$/)) {
      return true;
    }
    
    // Check for +84xxxxxxxxx format (12 digits)
    if (cleanPhone.match(/^\+84[3-9]\d{8}$/)) {
      return true;
    }
    
    // Check for 84xxxxxxxxx format (11 digits, without + prefix)
    if (cleanPhone.match(/^84[3-9]\d{8}$/)) {
      return true;
    }
    
    return false;
  }

  /**
   * Get display format of phone number (with 0 prefix for display)
   * @param phoneNumber - Phone number in any format
   * @returns Phone number in display format (0xxxxxxxxx)
   */
  static getDisplayFormat(phoneNumber: string): string {
    if (!phoneNumber) {
      return phoneNumber;
    }

    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // If starts with +84, convert to 0xxx format
    if (cleanPhone.startsWith('+84')) {
      return '0' + cleanPhone.substring(3);
    }

    // If starts with 84, convert to 0xxx format
    if (cleanPhone.startsWith('84') && !cleanPhone.startsWith('840')) {
      return '0' + cleanPhone.substring(2);
    }

    // If already starts with 0, return as is
    if (cleanPhone.startsWith('0')) {
      return cleanPhone;
    }

    // Otherwise, add 0 prefix
    return '0' + cleanPhone;
  }
}
