import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import ms from 'ms';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SmsService } from './two-factor/sms.service';

@Module({
  imports: [PrismaModule, UsersModule, PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION_TIME") || "24h"
        }
      }),
      inject: [ConfigService]
    })
  ],

  providers: [AuthService, LocalStrategy, JwtStrategy, SmsService],
  controllers: [AuthController],
})
export class AuthModule { }