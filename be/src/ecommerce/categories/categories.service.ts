import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Categories } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Categories[]> {
    return this.prisma.categories.findMany({
      where: { isDeleted: false },
      include: {
        children: {
          where: { isDeleted: false },
        },
        _count: {
          select: {
            products: {
              where: { isDeleted: false }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Categories | null> {
    return this.prisma.categories.findFirst({
      where: { id, isDeleted: false },
      include: {
        children: {
          where: { isDeleted: false },
        },
        products: {
          where: { isDeleted: false },
          take: 10,
        },
        _count: {
          select: {
            products: {
              where: { isDeleted: false }
            }
          }
        }
      },
    });
  }

  async findBySlug(slug: string): Promise<Categories | null> {
    return this.prisma.categories.findFirst({
      where: { slug, isDeleted: false },
      include: {
        children: {
          where: { isDeleted: false },
        },
        products: {
          where: { isDeleted: false },
          take: 10,
        },
        _count: {
          select: {
            products: {
              where: { isDeleted: false }
            }
          }
        }
      },
    });
  }

  async getTopCategories(limit: number = 6): Promise<Categories[]> {
    return this.prisma.categories.findMany({
      where: { 
        isDeleted: false,
        parent_id: null, // Only top-level categories
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
        products: {
          _count: 'desc'
        }
      },
      take: limit,
    });
  }

  async getCategoryTree(): Promise<Categories[]> {
    return this.prisma.categories.findMany({
      where: { 
        isDeleted: false,
        parent_id: null, // Only parent categories
      },
      include: {
        children: {
          where: { isDeleted: false },
          include: {
            children: {
              where: { isDeleted: false },
              include: {
                _count: {
                  select: {
                    products: {
                      where: { isDeleted: false }
                    }
                  }
                }
              }
            },
            _count: {
              select: {
                products: {
                  where: { isDeleted: false }
                }
              }
            }
          }
        },
        _count: {
          select: {
            products: {
              where: { isDeleted: false }
            }
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async getFeaturedCategories(): Promise<any[]> {
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
      take: 4,
    });

    return categories.map(category => ({
      ...category,
      image: category.image ? `/images/${category.image}` : null
    }));
  }
}
