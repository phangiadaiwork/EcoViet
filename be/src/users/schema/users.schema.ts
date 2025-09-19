import { Gender } from "@prisma/client";


export class IUSER {
    id: string;
    email: string;
    password: string;
    name: string;
    address: string;
    phone: string;
    avatar: string;
    gender: Gender;
    description: string;
    refreshToken: string;
    roleId: number;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    newsletter_subscribed: boolean;
    two_factor_enabled: boolean;
    two_factor_secret: string;
}   