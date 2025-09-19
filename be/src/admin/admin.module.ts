import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoriesService } from '../ecommerce/categories/categories.service';
import { ProductsService } from '../ecommerce/products/products.service';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, CategoriesService, ProductsService],
})
export class AdminModule { }
