import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, MinLength, Matches, IsNumber } from 'class-validator';
import { IsVietnamesePhone } from '../../decorators/vietnamese-phone.decorator';

export enum Gender {
    Male = 'Male',
    Female = 'Female',
}

export class RegisterUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])/, { message: "Mật khẩu phải có ít nhất một chữ số" })
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsNotEmpty()
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    roleId?: number;
}
