import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsLogger {
  private readonly logger = new Logger(SmsLogger.name);

  logSmsAttempt(to: string, originalNumber: string, messageType: 'OTP' | '2FA' | 'VERIFICATION', code?: string) {
    this.logger.log(`SMS ${messageType} attempt:`, {
      to: to,
      originalNumber: originalNumber,
      messageType: messageType,
      timestamp: new Date().toISOString(),
      // Don't log the actual code in production for security
      codeLength: code ? code.length : undefined
    });
  }

  logSmsResult(to: string, success: boolean, error?: string) {
    if (success) {
      this.logger.log(`SMS sent successfully to ${to}`);
    } else {
      this.logger.error(`SMS failed to ${to}: ${error}`);
    }
  }

  logPhoneFormatting(original: string, formatted: string) {
    this.logger.debug(`Phone formatting: ${original} -> ${formatted}`);
  }
}
