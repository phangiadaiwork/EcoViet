import { Body, Controller, Get, Post, Req, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { User } from 'src/decorators/user.decorator';
import { IUSER } from 'src/users/schema/users.schema';
import { LocalAuthGuard } from './local-auth.guard';
import { Request, Response } from 'express';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { Roles } from 'src/decorators/role.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PhoneLoginDto, VerifyOtpDto, SendOtpDto, Verify2FADto, ResetPasswordDto } from './dto/phone-login.dto';
import { PublicRegisterDto, Gender } from './dto/public-register.dto';
import { SmsService } from './two-factor/sms.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private smsService: SmsService
    ) { }

    // Api forgot password
    @Public()
    @Post("forgot-password")
    @ResponseMessage("Forgot password")
    handleForgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    // Api get user information
    @ResponseMessage("Get user information")
    @Get("account")
    handleGetAccount(@User() user: IUSER) {
        this.usersService.findOneByField("id", user.id);
    }

    // Api register a new user
    @Roles('1')
    @Post("register")
    @ResponseMessage("register a new user")
    async handleRegister(@Body() user: RegisterUserDto) {
        return await this.usersService.register(user);
    }

    // Api login (deprecated - use phone-login instead)
    @Public()
    @ResponseMessage("Endpoint này đã deprecated, vui lòng sử dụng phone-login")
    @Post("login")
    async handleLogin(
        @Body() loginData: any
    ) {
        throw new BadRequestException("Vui lòng sử dụng đăng nhập bằng số điện thoại");
    }

    // Api get user by refresh token
    @Public()
    @ResponseMessage("Get user by refresh token")
    @Get("refresh")
    handleRefreshToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies["refresh_token"]
        return this.authService.processNewToken(refreshToken, res);
    }

    // Api logout
    @Post("logout")
    @ResponseMessage("Logout")
    handleLogout(
        @User() user: IUSER,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.logout(res, user)
    }

    // Api change password
    @Post("change-password")
    @ResponseMessage("Change password")
    hadleChangePassword(
        @User() user: IUSER,
        @Body() changePass: ChangePasswordDto
    ) {
        return this.usersService.changePassword(user.email, changePass.oldPassword, changePass.newPassword);
    }

    // Api login with phone number
    @Public()
    @ResponseMessage("Đăng nhập bằng số điện thoại")
    @Post("phone-login")
    async handlePhoneLogin(
        @Body() phoneLoginDto: PhoneLoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.phoneLogin(phoneLoginDto, res);
    }

    // Api send OTP for registration
    @Public()
    @ResponseMessage("Gửi mã OTP")
    @Post("send-otp")
    async handleSendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto.phone);
    }

    // Api verify OTP for registration
    @Public()
    @ResponseMessage("Xác thực OTP")
    @Post("verify-otp")
    async handleVerifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.otp);
    }

    // Api verify 2FA code
    @Public()
    @ResponseMessage("Xác thực 2FA")
    @Post("verify-2fa")
    async handleVerify2FA(
        @Body() verify2FADto: Verify2FADto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.verify2FA(verify2FADto.sessionId, verify2FADto.code, res);
    }

    // Api reset password by phone
    @Public()
    @ResponseMessage("Đặt lại mật khẩu")
    @Post("reset-password")
    async handleResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPasswordByPhone(resetPasswordDto.phone, resetPasswordDto.newPassword);
    }

    // Api public register for users
    @Public()
    @ResponseMessage("Đăng ký tài khoản")
    @Post("public-register")
    async handlePublicRegister(@Body() publicRegisterDto: PublicRegisterDto) {
        // Check if OTP is verified before allowing registration
        if (!this.authService.isOtpVerified(publicRegisterDto.phone)) {
            throw new BadRequestException("Vui lòng xác thực OTP trước khi đăng ký");
        }

        // Convert to RegisterUserDto format
        const registerData = {
            email: publicRegisterDto.email,
            password: publicRegisterDto.password,
            name: publicRegisterDto.name,
            phone: publicRegisterDto.phone,
            address: publicRegisterDto.address || '',
            avatar: publicRegisterDto.avatar || '',
            gender: (publicRegisterDto.gender as Gender) || Gender.Male,
            description: publicRegisterDto.description || '',
            roleId: 2 // Default to User role
        };

        return await this.usersService.register(registerData);
    }
}
