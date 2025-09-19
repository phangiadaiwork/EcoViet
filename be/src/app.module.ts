import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { resolve } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';

// Core modules
import { CoreModule } from './core/core.module';

// E-commerce modules
import { ProductsModule } from './ecommerce/products/products.module';
import { CategoriesModule } from './ecommerce/categories/categories.module';
import { PaymentsModule } from './ecommerce/payments/payments.module';
import { OrdersModule } from './ecommerce/orders/orders.module';
import { CartModule } from './ecommerce/cart/cart.module';
import { HomeModule } from './ecommerce/home/home.module';

// Two-Factor Auth module
import { TwoFactorModule } from './auth/two-factor/two-factor.module';

// File module
import { FileModule } from './file/file.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ServeStaticModule.forRoot(
      (() => {
        const publicDir = resolve('./public/images/');
        const servePath = '/images';

        return {
          rootPath: publicDir,
          serveRoot: servePath,
          exclude: ['/api*'],
          serveStaticOptions: {
            index: false, // Don't try to serve index.html for directories
            dotfiles: 'ignore',
            fallthrough: false, // Don't fallthrough to next middleware if file not found
          },
        };
      })()
    ),
    // Core modules
    PrismaModule,
    CoreModule,
    UsersModule, 
    AuthModule, 
    AdminModule, 
    FileModule, 
    
    // E-commerce modules
    ProductsModule,
    CategoriesModule,
    PaymentsModule,
    OrdersModule,
    CartModule,
    HomeModule,
    
    // Two-Factor Auth
    TwoFactorModule,
  ],
})
export class AppModule { }
