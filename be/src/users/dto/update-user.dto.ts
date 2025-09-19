import { IsEmail, IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { IsVietnamesePhone } from '../../decorators/vietnamese-phone.decorator';
import { Gender } from './register-user.dto';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    @IsVietnamesePhone({ message: 'Số điện thoại không hợp lệ' })
    phone?: string;

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
