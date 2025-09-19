import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Body,
  Put,
  Delete,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { User } from 'src/decorators/user.decorator';
import { IUSER } from './schema/users.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto, Change2FADto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }



  // Api delete user
  @Delete(":id")
  @Roles('1')
  @ResponseMessage("Delete user")
  deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUser(id);
  }


  // Api upload avatar
  @Post('avatar')
  @ResponseMessage("Upload avatar success")
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @User() user: IUSER,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }

  // Api get all users with role 1, 2, 3 and specialty, clinic if role is 2
  @Get()
  @Roles('1')
  @ResponseMessage("Get all users")
  findAll() {
    return this.usersService.findAll();
  }

  // Api create user
  @Post()
  @Roles('1')
  @ResponseMessage("Create user")
  createUser(@Body() body: RegisterUserDto) {
    return this.usersService.register(body);
  }


  // Api update user
  @Put()
  @Roles('1')
  @ResponseMessage("Update user")
  updateUser(
    @Body() body: UpdateUserDto
  ) {
    return this.usersService.updateUser(body);
  }

  // Api get current user profile
  @Get('profile')
  @ResponseMessage("Get user profile")
  getUserProfile(@User() user: IUSER) {
    return this.usersService.getProfile(user.id);
  }

  // Api update current user profile
  @Put('profile')
  @ResponseMessage("Update user profile")
  updateProfile(
    @User() user: IUSER,
    @Body() body: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  // Api get 2FA status
  @Get('2fa/status')
  @ResponseMessage("Get 2FA status")
  get2FAStatus(@User() user: IUSER) {
    return this.usersService.get2FAStatus(user.id);
  }

  // Api toggle 2FA
  @Post('2fa/toggle')
  @ResponseMessage("Toggle 2FA")
  toggle2FA(
    @User() user: IUSER,
    @Body() body: Change2FADto
  ) {
    return this.usersService.toggle2FA(user.id, body);
  }
}
