import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getHomePageData() {
    const [featuredProducts, featuredCategories] = await Promise.all([
      this.getFeaturedProducts(4),
      this.getFeaturedCategories(4)
    ]);

    return {
      featuredProducts,
      featuredCategories,
      success: true
    };
  }

  async getFeaturedProducts(limit: number = 4) {
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

    return products.map(product => {
      const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        price: Number(product.sale_price || product.price),
        image: product.images[0] ? product.images[0] : null,
        rating: Math.round(avgRating * 10) / 10,
        category: product.category.name,
        slug: product.slug
      };
    });
  }

  async getFeaturedCategories(limit: number = 4) {
    const categories = await this.prisma.categories.findMany({
      where: { 
        isDeleted: false,
      },
      include: {
        _count: {
          select: {
            products: {
              where: { isDeleted: false }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit,
    });

    return categories.map(category => ({
      id: category.id,
      name: category.name,
      image: category.image ? category.image : null,
      slug: category.slug,
      productCount: category._count.products
    }));
  }
}
