import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('auth/two-factor')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  
  @Post('enable')
  enableTwoFactor(@Request() req, @Body() body: any) {
    // Logic to enable 2FA
    return { message: 'Two-factor authentication enabled' };
  }

  @Post('disable')
  disableTwoFactor(@Request() req) {
    // Logic to disable 2FA
    return { message: 'Two-factor authentication disabled' };
  }

  @Post('verify')
  verifyTwoFactor(@Request() req, @Body() body: { token: string }) {
    // Logic to verify 2FA token
    return { message: 'Two-factor token verified' };
  }
}
