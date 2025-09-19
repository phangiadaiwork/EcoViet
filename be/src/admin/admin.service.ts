import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import _ from 'lodash';

import * as nodeMailer from 'nodemailer';


@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
  ) { }

  // Api get all users
  getUsers = async () => {
    const users = await this.prisma.users.findMany();
    if (!users) {
      throw new Error('Get users failed');
    }
    const users_without_sensitive = users.map(user => {
      const { password, refresh_token, ...rest } = user;
      return rest;
    });
    return users_without_sensitive;
  }


  // Api get dashboard
  getDashboard = async () => {
    const users = await this.prisma.users.count({
      where: {
        roleId: 2 // Regular users
      }
    });
    const admins = await this.prisma.users.count({
      where: {
        roleId: 1 // Admins
      }
    });
    const schedule = await this.prisma.orders.count(); // Replaced with orders count

    const specialties = await this.prisma.categories.count(); // Replaced with categories count

    return { users, admins, schedule, specialties };
  }

  // Categories management
  getCategories = async (query: any) => {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.categories.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              products: {
                where: { isDeleted: false }
              }
            }
          }
        },
        orderBy: { createAt: 'desc' }
      }),
      this.prisma.categories.count({ where })
    ]);

    const categoriesWithProductCount = items.map((category: any) => ({
      ...category,
      productCount: category._count.products
    }));

    return {
      items: categoriesWithProductCount,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  createCategory = async (data: any) => {
    const { name, description, parent_id, status = 'active' } = data;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    const categoryData: any = {
      name,
      slug,
      description,
      status
    };

    if (parent_id) {
      categoryData.parent = {
        connect: { id: parent_id }
      };
    }

    return this.prisma.categories.create({
      data: categoryData,
      include: {
        parent: true,
        children: true
      }
    });
  }

  updateCategory = async (id: string, data: any) => {
    const category = await this.prisma.categories.findFirst({
      where: { id, isDeleted: false }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { name, description, parent_id, status } = data;
    
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
    
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    
    if (parent_id !== undefined) {
      if (parent_id) {
        updateData.parent = { connect: { id: parent_id } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    return this.prisma.categories.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    });
  }

  deleteCategory = async (id: string) => {
    const category = await this.prisma.categories.findFirst({
      where: { id, isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.products.length > 0) {
      throw new Error('Cannot delete category with products');
    }

    return this.prisma.categories.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  // Products management
  getProducts = async (query: any) => {
    const { page = 1, limit = 10, search, category, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category_id = category;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          category: true,
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: { createAt: 'desc' }
      }),
      this.prisma.products.count({ where })
    ]);

    const productsWithReviewCount = items.map((product: any) => ({
      ...product,
      reviewCount: product._count.reviews
    }));

    return {
      items: productsWithReviewCount,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  createProduct = async (data: any) => {
    const { category_id, ...productData } = data;
    
    return this.prisma.products.create({
      data: {
        ...productData,
        category: {
          connect: { id: category_id }
        }
      },
      include: {
        category: true
      }
    });
  }

  updateProduct = async (id: string, data: any) => {
    const product = await this.prisma.products.findFirst({
      where: { id, isDeleted: false }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { category_id, ...updateData } = data;
    
    if (category_id) {
      updateData.category = { connect: { id: category_id } };
    }

    return this.prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
  }

  deleteProduct = async (id: string) => {
    const product = await this.prisma.products.findFirst({
      where: { id, isDeleted: false }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.products.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  // Orders management
  getOrders = async (query: any) => {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          order_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createAt: 'desc' }
      }),
      this.prisma.orders.count({ where })
    ]);

    return {
      items,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  updateOrderStatus = async (id: string, status: string) => {
    const order = await this.prisma.orders.findUnique({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.orders.update({
      where: { id },
      data: { status: status as OrderStatus }
    });
  }

  exportUserEmails = async () => {
    const users = await this.prisma.users.findMany({
      include: {
        role: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    // Create CSV header
    const headers = [
      'ID',
      'Name', 
      'Email',
      'Phone',
      'Address',
      'Gender',
      'Role',
      'Newsletter Subscribed',
      'Created Date',
      'Last Updated'
    ];

    // Create CSV rows
    const rows = users.map(user => {
      return [
        `"${user.id}"`,
        `"${user.name || ''}"`,
        `"${user.email || ''}"`,
        `"${user.phone || ''}"`,
        `"${user.address || ''}"`,
        `"${user.gender || ''}"`,
        `"${user.role?.name || ''}"`,
        `"${user.newsletter_subscribed ? 'Yes' : 'No'}"`,
        `"${user.createAt ? new Date(user.createAt).toLocaleDateString('vi-VN') : ''}"`,
        `"${user.updateAt ? new Date(user.updateAt).toLocaleDateString('vi-VN') : ''}"`
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    return Buffer.from('\uFEFF' + csv, 'utf-8'); // Add BOM for UTF-8 Excel compatibility
  }

  // Export user emails with filters
  exportUserEmailsWithFilters = async (filters: {
    roleId?: number;
    newsletterSubscribed?: boolean;
    gender?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const where: any = { isDeleted: false };

    // Apply filters
    if (filters.roleId) {
      where.roleId = filters.roleId;
    }

    if (filters.newsletterSubscribed !== undefined) {
      where.newsletter_subscribed = filters.newsletterSubscribed;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createAt = {};
      if (filters.dateFrom) {
        where.createAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createAt.lte = new Date(filters.dateTo);
      }
    }

    const users = await this.prisma.users.findMany({
      where,
      include: {
        role: {
          select: {
            name: true
          }
        },
        orders: {
          select: {
            id: true,
            total_amount: true,
            createAt: true
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      }
    });

    // Create CSV header with additional order information
    const headers = [
      'ID',
      'Name', 
      'Email',
      'Phone',
      'Address',
      'Gender',
      'Role',
      'Newsletter Subscribed',
      'Total Orders',
      'Total Spent',
      'Last Order Date',
      'Created Date',
      'Last Updated'
    ];

    // Create CSV rows
    const rows = users.map(user => {
      const totalOrders = user.orders.length;
      const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const lastOrderDate = user.orders.length > 0 
        ? new Date(Math.max(...user.orders.map(o => new Date(o.createAt).getTime()))).toLocaleDateString('vi-VN')
        : '';

      return [
        `"${user.id}"`,
        `"${user.name || ''}"`,
        `"${user.email || ''}"`,
        `"${user.phone || ''}"`,
        `"${user.address || ''}"`,
        `"${user.gender || ''}"`,
        `"${user.role?.name || ''}"`,
        `"${user.newsletter_subscribed ? 'Yes' : 'No'}"`,
        `"${totalOrders}"`,
        `"${totalSpent.toLocaleString('vi-VN')} VND"`,
        `"${lastOrderDate}"`,
        `"${user.createAt ? new Date(user.createAt).toLocaleDateString('vi-VN') : ''}"`,
        `"${user.updateAt ? new Date(user.updateAt).toLocaleDateString('vi-VN') : ''}"`
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    return Buffer.from('\uFEFF' + csv, 'utf-8'); // Add BOM for UTF-8 Excel compatibility
  }
}
