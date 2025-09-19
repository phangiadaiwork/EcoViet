import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { Products } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Products> {
    const { category_id, ...productData } = createProductDto;
    
    return this.prisma.products.create({
      data: {
        ...productData,
        category: {
          connect: { id: category_id }
        }
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, category, search, sort, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false
    };

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { meta_keywords: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price-asc':
        orderBy.price = 'asc';
        break;
      case 'price-desc':
        orderBy.price = 'desc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      default:
        orderBy.createAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        include: {
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.products.count({ where })
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string): Promise<Products> {
    const product = await this.prisma.products.findUnique({
      where: { id, isDeleted: false },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Products> {
    const product = await this.prisma.products.findUnique({
      where: { slug, isDeleted: false },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Products> {
    const { category_id, ...productData } = updateProductDto;

    const updateData: any = { ...productData };

    if (category_id) {
      updateData.category = {
        connect: { id: category_id }
      };
    }

    return this.prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.products.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  async getFeaturedProducts(limit: number = 8) {
    const products = await this.prisma.products.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createAt: 'desc'
      },
      take: limit
    });

    // Calculate average rating and format data
    return products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        rating: Math.round(avgRating * 10) / 10,
        image: product.images[0] ? `/images/${product.images[0]}` : null,
        price: Number(product.sale_price || product.price)
      };
    });
  }

  async getRelatedProducts(categoryId: string, currentProductId: string, limit: number = 4) {
    return this.prisma.products.findMany({
      where: {
        category_id: categoryId,
        id: { not: currentProductId },
        isDeleted: false
      },
      include: {
        category: true,
        reviews: true
      },
      take: limit
    });
  }

  async getAllSlugs(): Promise<string[]> {
    const products = await this.prisma.products.findMany({
      where: { isDeleted: false },
      select: { slug: true }
    });
    return products.map(p => p.slug);
  }
}
