import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from './sms.service';
import { PhoneUtil } from '../../utils/phone.util';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async generateSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `ECommerce (${user.email})`,
      issuer: 'ECommerce Platform',
    });

    // Save the secret to the database
    await this.prisma.users.update({
      where: { id: userId },
      data: { two_factor_secret: secret.base32 },
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.two_factor_secret) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 2, // Allow for some time drift
    });

    return verified;
  }

  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyToken(userId, token);
    
    if (isValid) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { two_factor_enabled: true },
      });
      return true;
    }
    
    return false;
  }

  async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    const isValid = await this.verifyToken(userId, token);
    
    if (isValid) {
      await this.prisma.users.update({
        where: { id: userId },
        data: { 
          two_factor_enabled: false,
          two_factor_secret: null,
        },
      });
      return true;
    }
    
    return false;
  }

  async sendSmsVerification(phoneNumber: string): Promise<{ code: string; success: boolean }> {
    // Validate phone number format
    if (!PhoneUtil.isValidVietnamesePhoneNumber(phoneNumber)) {
      console.warn(`Invalid Vietnamese phone number format: ${phoneNumber}`);
      return { code: '', success: false };
    }

    const code = this.smsService.generateVerificationCode();
    
    try {
      const result = await this.smsService.sendVerificationCode(phoneNumber, code);
      return { code, success: true };
    } catch (error) {
      console.error('Failed to send SMS verification:', error);
      return { code: '', success: false };
    }
  }

  async verifySmsCode(phoneNumber: string, code: string, savedCode: string): Promise<boolean> {
    return code === savedCode;
  }
}
