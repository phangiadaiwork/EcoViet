import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsVietnamesePhone } from '../../decorators/vietnamese-phone.decorator';

export class PhoneLoginDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @IsString()
    password: string;
}

export class VerifyOtpDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsNotEmpty({ message: 'Mã OTP không được để trống' })
    @IsString()
    otp: string;
}

export class SendOtpDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;
}

export class Verify2FADto {
    @IsNotEmpty({ message: 'Mã 2FA không được để trống' })
    @IsString()
    code: string;

    @IsNotEmpty({ message: 'Session ID không được để trống' })
    @IsString()
    sessionId: string;
}

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}

export class ForgotPasswordSendOtpDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;
}

export class ForgotPasswordVerifyOtpDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsNotEmpty({ message: 'Mã OTP không được để trống' })
    @IsString()
    otp: string;
}