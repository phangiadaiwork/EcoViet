import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, orderData: any) {
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Extract items from orderData
    const { items, ...orderInfo } = orderData;
    
    // Calculate total from items
    const itemsTotal = items.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );
    
    return await this.prisma.orders.create({
      data: {
        order_number: orderNumber,
        user_id: userId,
        total_amount: orderInfo.total_amount || itemsTotal,
        shipping_fee: orderInfo.shipping_fee || 0,
        tax_amount: orderInfo.tax_amount || 0,
        discount_amount: orderInfo.discount_amount || 0,
        shipping_name: orderInfo.shipping_name,
        shipping_email: orderInfo.shipping_email,
        shipping_phone: orderInfo.shipping_phone,
        shipping_address: orderInfo.shipping_address,
        billing_name: orderInfo.billing_name || orderInfo.shipping_name,
        billing_email: orderInfo.billing_email || orderInfo.shipping_email,
        billing_phone: orderInfo.billing_phone || orderInfo.shipping_phone,
        billing_address: orderInfo.billing_address || orderInfo.shipping_address,
        notes: orderInfo.notes || '',
        status: OrderStatus.PENDING,
        order_items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.price) * item.quantity,
          }))
        }
      },
      include: {
        order_items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findUserOrders(userId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;
    
    const where: any = { 
      user_id: userId,
      isDeleted: false
    };
    
    if (status) {
      where.status = status;
    }
    
    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          order_items: {
            include: {
              product: true
            }
          },
          payments: true
        },
        orderBy: {
          createAt: 'desc'
        },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.orders.count({ where })
    ]);

    return {
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, status, user_email } = query;
    const skip = (page - 1) * limit;
    
    const where: any = { 
      isDeleted: false
    };
    
    if (status) {
      where.status = status;
    }
    
    if (user_email) {
      where.user = {
        email: {
          contains: user_email,
          mode: 'insensitive'
        }
      };
    }
    
    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        include: {
          order_items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          payments: true
        },
        orderBy: {
          createAt: 'desc'
        },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.orders.count({ where })
    ]);

    return {
      data: orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    };
  }

  async findOne(id: string, userId?: string) {
    const where: any = { 
      id,
      isDeleted: false
    };
    
    if (userId) {
      where.user_id = userId;
    }
    
    return await this.prisma.orders.findUnique({
      where,
      include: {
        order_items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
                sku: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        payments: true
      },
    });
  }

  async update(id: string, updateData: any) {
    return await this.prisma.orders.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return await this.prisma.orders.delete({
      where: { id },
    });
  }

  async cancel(id: string, userId: string) {
    return await this.prisma.orders.update({
      where: { 
        id,
        user_id: userId 
      },
      data: { 
        status: OrderStatus.CANCELLED
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return await this.prisma.orders.update({
      where: { id },
      data: { status },
    });
  }
}
