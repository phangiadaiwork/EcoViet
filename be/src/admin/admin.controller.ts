import { Controller, Get, Post, Body, HttpException, HttpStatus, Put, Delete, Param, Query, Request, Res, StreamableFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ResponseMessage } from 'src/decorators/response.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { Public } from 'src/decorators/public.decorator';

@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService
  ) { }

  @Get("users/export-email")
  @Public()
  @ResponseMessage("Export user emails")
  async exportUserEmails() {
    const buffer = await this.adminService.exportUserEmails();
    if (!buffer) {
      throw new HttpException('Failed to export emails', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return new StreamableFile(buffer);
  }

  @Get("users/export-email-filtered")
  @Public()
  @ResponseMessage("Export user emails with filters")
  async exportUserEmailsWithFilters(@Query() query: any) {
    const filters = {
      roleId: query.roleId ? parseInt(query.roleId) : undefined,
      newsletterSubscribed: query.newsletterSubscribed === 'true' ? true : query.newsletterSubscribed === 'false' ? false : undefined,
      gender: query.gender || undefined,
      dateFrom: query.dateFrom || undefined,
      dateTo: query.dateTo || undefined
    };

    const buffer = await this.adminService.exportUserEmailsWithFilters(filters);
    if (!buffer) {
      throw new HttpException('Failed to export emails', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return new StreamableFile(buffer);
  }

  //Api get all users
  @Get("users")
  @Roles('1')
  @ResponseMessage("Get all users")
  async getUsers() {
    return this.adminService.getUsers();
  }

  // Api dashboard
  @Get("dashboard")
  @Roles('1')
  @ResponseMessage("Get dashboard")
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // Debug endpoint to check current user
  @Get("debug/user")
  @ResponseMessage("Get current user debug info")
  async getCurrentUserDebug(@Request() req: any) {
    return {
      user: req.user,
      headers: req.headers.authorization
    };
  }

  // Categories management
  @Get("categories")
  @Roles('1')
  @ResponseMessage("Get all categories for admin")
  async getCategories(@Query() query: any) {
    return this.adminService.getCategories(query);
  }

  @Post("categories")
  @Roles('1') 
  @ResponseMessage("Create category")
  async createCategory(@Body() body: any) {
    return this.adminService.createCategory(body);
  }

  @Put("categories/:id")
  @Roles('1')
  @ResponseMessage("Update category")
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete("categories/:id")
  @Roles('1')
  @ResponseMessage("Delete category")
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Products management
  @Get("products")
  @Roles('1')
  @ResponseMessage("Get all products for admin")
  async getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }

  @Post("products")
  @Roles('1')
  @ResponseMessage("Create product")
  async createProduct(@Body() body: any) {
    return this.adminService.createProduct(body);
  }

  @Put("products/:id")
  @Roles('1')
  @ResponseMessage("Update product")
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateProduct(id, body);
  }

  @Delete("products/:id")
  @Roles('1')
  @ResponseMessage("Delete product")
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Orders management
  @Get("orders")
  @Roles('1')
  @ResponseMessage("Get all orders for admin")
  async getOrders(@Query() query: any) {
    return this.adminService.getOrders(query);
  }

  @Put("orders/:id/status")
  @Roles('1')
  @ResponseMessage("Update order status")
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateOrderStatus(id, body.status);
  }

  

}
