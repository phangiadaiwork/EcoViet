import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItems.findMany({
      where: { user_id: userId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    const total = cartItems.reduce((sum, item) => sum + (item.quantity * Number(item.product.price)), 0);

    return {
      user_id: userId,
      items: cartItems,
      total,
      count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { id: product_id, isDeleted: false }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItems.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id
        }
      }
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await this.prisma.cartItems.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });

      return updatedItem;
    } else {
      // Create new cart item
      const newItem = await this.prisma.cartItems.create({
        data: {
          user_id: userId,
          product_id,
          quantity
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });

      return newItem;
    }
  }

  async updateCartItem(itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    const cartItem = await this.prisma.cartItems.findUnique({
      where: { id: itemId },
      include: { product: true }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const updatedItem = await this.prisma.cartItems.update({
      where: { id: itemId },
      data: {
        quantity
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    return updatedItem;
  }

  async removeFromCart(itemId: string) {
    const cartItem = await this.prisma.cartItems.findUnique({
      where: { id: itemId }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItems.delete({
      where: { id: itemId }
    });

    return { message: 'Item removed from cart' };
  }

  async removeFromCartByProduct(userId: string, productId: string) {
    const cartItem = await this.prisma.cartItems.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId
        }
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItems.delete({
      where: { id: cartItem.id }
    });

    return { message: 'Item removed from cart' };
  }

  async updateCartQuantity(userId: string, productId: string, quantity: number) {
    const cartItem = await this.prisma.cartItems.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.prisma.cartItems.delete({
        where: { id: cartItem.id }
      });
      return { message: 'Item removed from cart' };
    }

    const updatedItem = await this.prisma.cartItems.update({
      where: { id: cartItem.id },
      data: { quantity },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    return updatedItem;
  }

  async clearCart(userId: string) {
    await this.prisma.cartItems.deleteMany({
      where: { user_id: userId }
    });

    return { message: 'Cart cleared' };
  }

  async getCartCount(userId: string) {
    const cartItems = await this.prisma.cartItems.findMany({
      where: { user_id: userId }
    });

    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    return { count };
  }
}
