import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUSER } from 'src/users/schema/users.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configServices: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configServices.get<string>("JWT_SECRET"),
        });
    }

    async validate(payload: Pick<IUSER, "address" | "name" | "email" | "gender" | "id" | "roleId" | "phone" | "avatar">) {
        const { id,
            email, address, name, gender, roleId, phone, avatar } = payload;

        return {
            id,
            email,
            address,
            name,
            gender,
            phone,
            roleId,
            avatar
        };
    }
}