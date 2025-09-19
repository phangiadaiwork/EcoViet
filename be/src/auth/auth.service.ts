import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { IUSER } from 'src/users/schema/users.schema';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { SmsService } from './two-factor/sms.service';
import { PhoneUtil } from '../utils/phone.util';
import { SmsLogger } from '../utils/sms-logger.util';

@Injectable()
export class AuthService {
    private otpStore = new Map<string, { code: string; expiresAt: number; verified?: boolean }>();
    private pendingLogins = new Map<string, { user: any; expiresAt: number }>();
    private readonly smsLogger = new SmsLogger();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private prisma: PrismaService,
        private smsService: SmsService
    ) { }

    // Api forgot password
    forgotPassword = async (value: string) => {
        const email = value.toLocaleLowerCase();
        const user = await this.prisma.users.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            throw new BadRequestException("Email không tồn tại");
        }

        // Generate new random password
        const newPassword = Math.random().toString(36).slice(-8);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password in database
        await this.prisma.users.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });
        return "Mật khẩu mới đã được gửi về email của bạn";
    }

    // Api login
    async login(user: Omit<IUSER, "refreshToken" | "createdAt" | "updatedAt">, res: Response) {
        const { email, address, name, id, gender, roleId, phone, avatar } = user;
        const payload = {
            sub: "token login",
            iss: "from sever",
            id,
            email,
            address,
            name,
            gender,
            roleId,
            phone,
            avatar
        }

        const refresh_token = this.createRefreshToken(payload);

        // Update user token directly via Prisma
        await this.prisma.users.update({
            where: { id },
            data: { refresh_token }
        });

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRED"))
        })

        return {
            user: {
                id,
                email,
                address,
                name,
                gender,
                roleId,
                phone,
                avatar,
            },
            access_token: this.jwtService.sign(payload),
        }
    }

    // Create refresh token
    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRED")) / 1000
        })

        return refresh_token;
    }

    // Validate user
    validateUser = async (email: string, pass: string): Promise<Omit<IUSER, "refreshToken" | "updatedAt" | "createdAt"> | null> => {
        const user = await this.prisma.users.findUnique(
            {
                where: {
                    email
                }
            }
        );
        if (user) {
            const isValid = this.isValidPassword(pass, user.password);
            if (isValid === true) {
                return user;
            }
        }
        return null;
    }

    // Validate user by phone
    validateUserByPhone = async (phone: string, pass: string): Promise<Omit<IUSER, "refreshToken" | "updatedAt" | "createdAt"> | null> => {
        const user = await this.prisma.users.findUnique(
            {
                where: {
                    phone
                }
            }
        );
        if (user) {
            const isValid = this.isValidPassword(pass, user.password);
            if (isValid === true) {
                return user;
            }
        }
        return null;
    }

    // Validate password
    isValidPassword = (password: string, hash: string): boolean => {
        return bcrypt.compareSync(password, hash);
    }

    // Process new token
    processNewToken = async (refreshToken: string, res: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            })

            const user = await this.prisma.users.findFirst({
                where: { 
                    refresh_token: refreshToken,
                    isDeleted: false
                },
                include: {
                    role: true
                }
            });
            if (user) {
                res.clearCookie("refresh_token");
                return await this.login(user, res);
            }
            else {
                throw new BadRequestException("Refresh token không hợp lệ. Vui lòng đăng nhập lại")
            }
        } catch (error) {
            throw new BadRequestException("Refresh token không hợp lệ. Vui lòng đăng nhập lại")
        }
    }

    // Api logout
    logout = async (res: Response, user: IUSER) => {
        await this.prisma.users.update({
            where: { id: user.id },
            data: { refresh_token: "" }
        });
        res.clearCookie("refresh_token");
        return "success";
    }

    // Phone login with 2FA
    phoneLogin = async (phoneLoginDto: PhoneLoginDto, res: Response) => {
        const user = await this.validateUserByPhone(phoneLoginDto.phone, phoneLoginDto.password);
        
        if (!user) {
            throw new BadRequestException("Số điện thoại hoặc mật khẩu không đúng");
        }

        // Check if 2FA is enabled
        if (user.two_factor_enabled) {
            // Generate 2FA code and send SMS
            const code = this.smsService.generateVerificationCode();
            const sessionId = this.generateSessionId();
            
            // Store pending login
            this.pendingLogins.set(sessionId, {
                user,
                expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
            });

            // Send 2FA code via SMS
            const formattedPhone = PhoneUtil.formatVietnamesePhoneNumber(user.phone);
            this.smsLogger.logSmsAttempt(formattedPhone, user.phone, '2FA', code);
            await this.smsService.sendVerificationCode(user.phone, code);
            
            // Store 2FA code
            this.otpStore.set(sessionId, {
                code,
                expiresAt: Date.now() + 5 * 60 * 1000
            });

            return {
                requireTwoFactor: true,
                sessionId,
                message: "Mã xác thực 2FA đã được gửi đến số điện thoại của bạn"
            };
        }

        // If 2FA is not enabled, proceed with normal login
        return this.login(user, res);
    }

    // Send OTP for registration
    sendOtp = async (phone: string) => {
        // Validate phone number format
        if (!PhoneUtil.isValidVietnamesePhoneNumber(phone)) {
            throw new BadRequestException("Số điện thoại không hợp lệ");
        }

        // Check if phone already exists (only for registration)
        const existingUser = await this.prisma.users.findUnique({
            where: { phone }
        });

        if (existingUser) {
            throw new BadRequestException("Số điện thoại đã được sử dụng");
        }

        const code = this.smsService.generateVerificationCode();
        
        // Store OTP
        this.otpStore.set(phone, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });


        // Send SMS with formatted phone number
        const formattedPhone = PhoneUtil.formatVietnamesePhoneNumber(phone);
        this.smsLogger.logSmsAttempt(formattedPhone, phone, 'OTP', code);
        await this.smsService.sendVerificationCode(phone, code);

        return {
            message: "Mã OTP đã được gửi đến số điện thoại của bạn",
            expiresIn: 300 // 5 minutes in seconds
        };
    }

    // Verify OTP for registration
    verifyOtp = async (phone: string, otp: string) => {
        
        const storedOtp = this.otpStore.get(phone);
        
        if (!storedOtp) {
            throw new BadRequestException("Mã OTP không tồn tại hoặc đã hết hạn");
        }

        if (storedOtp.expiresAt < Date.now()) {
            this.otpStore.delete(phone);
            throw new BadRequestException("Mã OTP đã hết hạn");
        }

        if (storedOtp.code !== otp) {
            throw new BadRequestException("Mã OTP không đúng");
        }

        // Mark OTP as verified
        this.otpStore.set(phone, { ...storedOtp, verified: true });

        return {
            message: "Xác thực OTP thành công",
            verified: true
        };
    }

    // Verify 2FA code
    verify2FA = async (sessionId: string, code: string, res: Response) => {
        const storedCode = this.otpStore.get(sessionId);
        const pendingLogin = this.pendingLogins.get(sessionId);

        if (!storedCode || !pendingLogin) {
            throw new BadRequestException("Session không tồn tại hoặc đã hết hạn");
        }

        if (storedCode.expiresAt < Date.now() || pendingLogin.expiresAt < Date.now()) {
            this.otpStore.delete(sessionId);
            this.pendingLogins.delete(sessionId);
            throw new BadRequestException("Mã xác thực đã hết hạn");
        }

        if (storedCode.code !== code) {
            throw new BadRequestException("Mã xác thực 2FA không đúng");
        }

        // Clean up
        this.otpStore.delete(sessionId);
        this.pendingLogins.delete(sessionId);

        // Complete login
        return this.login(pendingLogin.user, res);
    }

    // Generate session ID
    private generateSessionId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    // Check if OTP is verified for registration
    isOtpVerified = (phone: string): boolean => {
        const storedOtp = this.otpStore.get(phone);
        return storedOtp && storedOtp.verified === true;
    }

    // Reset password using phone and OTP verification
    resetPasswordByPhone = async (phone: string, newPassword: string) => {
        // Check if forgot password OTP is verified
        const forgotKey = `forgot_${phone}`;
        const storedOtp = this.otpStore.get(forgotKey);
        
        if (!storedOtp || !storedOtp.verified) {
            throw new BadRequestException("Vui lòng xác thực OTP trước khi đặt lại mật khẩu");
        }

        // Find user by phone
        const user = await this.prisma.users.findUnique({
            where: { phone }
        });

        if (!user) {
            throw new BadRequestException("Không tìm thấy tài khoản với số điện thoại này");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await this.prisma.users.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        // Clean up OTP after successful password reset
        this.otpStore.delete(forgotKey);

        return {
            message: "Đặt lại mật khẩu thành công"
        };
    }

    // Send OTP for forgot password
    sendForgotPasswordOtp = async (phone: string) => {
        
        // Validate phone number format
        if (!PhoneUtil.isValidVietnamesePhoneNumber(phone)) {
            throw new BadRequestException("Số điện thoại không hợp lệ");
        }

        // Check if phone exists (required for forgot password)
        const existingUser = await this.prisma.users.findUnique({
            where: { phone }
        });

        if (!existingUser) {
            throw new BadRequestException("Số điện thoại không tồn tại trong hệ thống");
        }

        const code = this.smsService.generateVerificationCode();
        
        // Store OTP with special prefix to distinguish from registration OTP
        this.otpStore.set(`forgot_${phone}`, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });


        // Send SMS with formatted phone number
        const formattedPhone = PhoneUtil.formatVietnamesePhoneNumber(phone);
        this.smsLogger.logSmsAttempt(formattedPhone, phone, 'OTP', code);
        await this.smsService.sendVerificationCode(phone, code);

        return {
            message: "Mã OTP đã được gửi đến số điện thoại của bạn",
            expiresIn: 300 // 5 minutes in seconds
        };
    }

    // Verify OTP for forgot password
    verifyForgotPasswordOtp = async (phone: string, otp: string) => {
        
        const forgotKey = `forgot_${phone}`;
        const storedOtp = this.otpStore.get(forgotKey);
        
        if (!storedOtp) {
            throw new BadRequestException("Mã OTP không tồn tại hoặc đã hết hạn");
        }

        if (storedOtp.expiresAt < Date.now()) {
            this.otpStore.delete(forgotKey);
            throw new BadRequestException("Mã OTP đã hết hạn");
        }

        if (storedOtp.code !== otp) {
            throw new BadRequestException("Mã OTP không đúng");
        }

        // Mark OTP as verified
        this.otpStore.set(forgotKey, { ...storedOtp, verified: true });

        return {
            message: "Xác thực OTP thành công",
            verified: true
        };
    }
}