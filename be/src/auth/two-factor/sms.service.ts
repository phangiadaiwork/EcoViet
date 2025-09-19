import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';
import { PhoneUtil } from '../../utils/phone.util';
import { SmsLogger } from '../../utils/sms-logger.util';

@Injectable()
export class SmsService {
  private vonageClient: Vonage;
  private readonly smsLogger = new SmsLogger();

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('VONAGE_API_KEY');
    const apiSecret = this.configService.get('VONAGE_API_SECRET');
    
    // Only initialize Vonage if credentials are properly configured
    if (apiKey && apiSecret) {
      try {
        const auth = new Auth({
          apiKey: apiKey,
          apiSecret: apiSecret,
        });
        this.vonageClient = new Vonage(auth);
      } catch (error) {
        console.warn('Failed to initialize Vonage client:', error.message);
      }
    } else {
      console.warn('Vonage credentials not properly configured. SMS service will be disabled.');
    }
  }

  async sendSMS(to: string, message: string): Promise<any> {
    if (!this.vonageClient) {
      console.warn('Vonage client not initialized. SMS service disabled.');
      this.smsLogger.logSmsResult(to, false, 'Vonage client not initialized');
      return { success: false, message: 'SMS service not configured' };
    }
    
    try {
      // Format phone number to international format (+84xxx)
      const formattedPhone = PhoneUtil.formatVietnamesePhoneNumber(to);
      this.smsLogger.logPhoneFormatting(to, formattedPhone);
      
      const from = this.configService.get('VONAGE_FROM_NUMBER') || 'Vonage APIs';
      const result = await this.vonageClient.sms.send({
        to: formattedPhone,
        from: from,
        text: message,
      });
      
      this.smsLogger.logSmsResult(formattedPhone, true);
      return result;
    } catch (error) {
      this.smsLogger.logSmsResult(to, false, error.message);
      return { success: false, message: `Failed to send SMS: ${error.message}` };
    }
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<any> {
    // Validate phone number before sending
    if (!PhoneUtil.isValidVietnamesePhoneNumber(phoneNumber)) {
      console.warn(`Invalid Vietnamese phone number format: ${phoneNumber}`);
      this.smsLogger.logSmsResult(phoneNumber, false, 'Invalid phone number format');
      return { success: false, message: 'Invalid phone number format' };
    }

    this.smsLogger.logSmsAttempt(PhoneUtil.formatVietnamesePhoneNumber(phoneNumber), phoneNumber, 'VERIFICATION', code);
    
    const message = `Your verification code is: ${code}. This code will expire in 5 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
