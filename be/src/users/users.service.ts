import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUSER } from './schema/users.schema';
import * as xlsx from 'xlsx';
import { FileService } from 'src/file/file.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto, Change2FADto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService
  ) { }



  // Api delete user
  deleteUser = async (id: string) => {
    const user = await this.findOneByField("id", id);

    const deleteUser = await this.prisma.users.delete({
      where: {
        id
      }
    })

    if (deleteUser) {
      return "success";
    }
    else {
      throw new BadRequestException("Xóa người dùng thất bại")
    }
  }

  // Api get all users
  findAll = async () => {
    const users = await this.prisma.users.findMany({
      where: {
        roleId: {
          in: [1, 2, 3]
        }
      },
      include: {
        role: true
      
      }
    });


    if (users) {
      return users;
    }
    else {
      throw new NotFoundException("Không tìm thấy người dùng nào");
    }
  }

  // Api change password
  changePassword = async (email: string, oldPassword: string, newPassword: string) => {
    const user = await this.findOneByField("email", email);

    if (!user) {
      throw new NotFoundException(`Email ${email} không tồn tại trên hệ thống`)
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Mật khẩu cũ không đúng")
    }

    const passwordHash = this.getHashPassword(newPassword);

    const newUserPass = await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        password: passwordHash,
      }
    })

    return "success";
  }

  // Api update user
  updateUser = async (user: UpdateUserDto) => {
    const isExist = await this.findOneByField("email", user.email);

    if (isExist && isExist.id !== user.id) {
      throw new BadRequestException(`Email ${user.email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`)
    }

 

    return await this.prisma.users.update({
      where: { id: user.id },
      data: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        roleId: user.roleId,
      }
    })
  }


  // Api get hash password
  getHashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }


  // Api register user
  async register(user: RegisterUserDto) {

    const isExist = await this.findOneByField("email", user.email);
    if (isExist) {
      throw new BadRequestException(`Email ${user.email.toLocaleLowerCase()} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác`)
    }

    // Check if phone already exists
    const phoneExists = await this.prisma.users.findUnique({
      where: { phone: user.phone }
    });
    if (phoneExists) {
      throw new BadRequestException(`Số điện thoại ${user.phone} đã tồn tại trên hệ thống. Vui lòng sử dụng số điện thoại khác`)
    }

    const passwordHash = this.getHashPassword(user.password);
    const newUserPass = await this.prisma.users.create({
      data: {
        email: user.email.toLowerCase(),
        password: passwordHash,
        name: user.name,
        phone: user.phone,
        address: user.address || '',
        roleId: user.roleId || 2, // Default to User role
        gender: user.gender || 'Male',
        avatar: user.avatar || '',
        description: user.description || ''
      },
    });

    return newUserPass;
  }


  // Api update user token
  async updateUserToken(refresh_token: string, id: string) {
    return await this.prisma.users.update(
      {
        where: {
          id,
        },
        data: {
          refresh_token,
        },
      }
    )
  }

  // Api find one by field
  findOneByField = async (key: string, value: string): Promise<Omit<IUSER, "refreshToken" | "createdAt" | "updatedAt"> | null> => {
    return await this.prisma.users.findFirst({
      where: {
        [key]: value,
      },
    });
  }

  // Api update avatar
  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.prisma.users.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Không tìm thấy user với ID ${id}`);
    }

    const fileName = await this.fileService.saveFileAvatar(file, 'users');

    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        avatar: fileName
      }
    });
    if (!updatedUser) {
      throw new BadRequestException("Cập nhật avatar thất bại");
    }

    return fileName;
  }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        gender: true,
        description: true,
        newsletter_subscribed: true,
        two_factor_enabled: true,
        createAt: true,
        updateAt: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // Check if email is being changed and is unique
    if (updateData.email) {
      const existingUser = await this.prisma.users.findFirst({
        where: {
          email: updateData.email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new BadRequestException('Email đã được sử dụng');
      }
    }

    // Check if phone is being changed and is unique
    if (updateData.phone) {
      const existingUser = await this.prisma.users.findFirst({
        where: {
          phone: updateData.phone,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    const updatedUser = await this.prisma.users.update({
      where: { id: userId },
      data: {
        ...updateData,
        updateAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar: true,
        gender: true,
        description: true,
        newsletter_subscribed: true,
        two_factor_enabled: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedUser;
  }

  // Get 2FA status
  async get2FAStatus(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { two_factor_enabled: true }
    });

    return {
      enabled: user?.two_factor_enabled || false
    };
  }

  // Toggle 2FA
  async toggle2FA(userId: string, changeData: Change2FADto) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // If disabling 2FA, verify password
    if (user.two_factor_enabled && !changeData.enabled) {
      if (!changeData.password) {
        throw new BadRequestException('Vui lòng nhập mật khẩu để tắt 2FA');
      }

      const isPasswordValid = await bcrypt.compare(changeData.password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Mật khẩu không đúng');
      }
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        two_factor_enabled: changeData.enabled || false,
        two_factor_secret: changeData.enabled ? null : null, // Clear secret when disabling
        updateAt: new Date()
      }
    });

    return {
      enabled: changeData.enabled || false,
      message: changeData.enabled ? 'Bật 2FA thành công' : 'Tắt 2FA thành công'
    };
  }

  // Delete user account (soft delete)
  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Verify password before deletion
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu không đúng');
    }

    await this.prisma.users.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        updateAt: new Date()
      }
    });

    return {
      message: 'Xóa tài khoản thành công'
    };
  }
}