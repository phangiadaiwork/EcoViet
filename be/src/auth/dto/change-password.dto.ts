import { IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    oldPassword: string;

    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[0-9])/, { message: "Mật khẩu phải có ít nhất một chữ số" })
    newPassword: string;
}