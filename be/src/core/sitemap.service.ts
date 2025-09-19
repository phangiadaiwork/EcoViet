import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';

@Injectable()
export class SitemapService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateSitemap(): Promise<Buffer> {
    const baseUrl = this.configService.get('BASE_URL') || 'https://yourdomain.com';
    
    const sitemap = new SitemapStream({
      hostname: baseUrl,
    });

    // Add static pages
    sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
    sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.8 });
    sitemap.write({ url: '/products', changefreq: 'daily', priority: 0.9 });
    sitemap.write({ url: '/categories', changefreq: 'weekly', priority: 0.8 });
    sitemap.write({ url: '/news', changefreq: 'daily', priority: 0.7 });

    // Add product pages
    const products = await this.prisma.products.findMany({
      where: { isDeleted: false },
      select: { slug: true, updateAt: true },
    });

    for (const product of products) {
      sitemap.write({
        url: `/products/${product.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: product.updateAt.toISOString(),
      });
    }

    // Add category pages
    const categories = await this.prisma.categories.findMany({
      where: { isDeleted: false },
      select: { slug: true, updateAt: true },
    });

    for (const category of categories) {
      sitemap.write({
        url: `/categories/${category.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: category.updateAt.toISOString(),
      });
    }

    sitemap.end();

    const buffer = await streamToPromise(sitemap);
    return buffer;
  }

  async generateCompressedSitemap(): Promise<Buffer> {
    const sitemap = await this.generateSitemap();
    return new Promise((resolve, reject) => {
      const gzip = createGzip();
      const chunks: Buffer[] = [];
      
      gzip.on('data', (chunk) => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);
      
      gzip.write(sitemap);
      gzip.end();
    });
  }
}
