import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { SitemapService } from '../core/sitemap.service';
import { Public } from '../decorators/public.decorator';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Public()
  @Header('Content-Type', 'application/xml')
  async getSitemap(@Res() res: Response) {
    try {
      const sitemap = await this.sitemapService.generateSitemap();
      res.send(sitemap);
    } catch (error) {
      res.status(500).send('Error generating sitemap');
    }
  }

  @Get('sitemap.xml.gz')
  @Public()
  @Header('Content-Type', 'application/gzip')
  @Header('Content-Encoding', 'gzip')
  async getCompressedSitemap(@Res() res: Response) {
    try {
      const compressedSitemap = await this.sitemapService.generateCompressedSitemap();
      res.send(compressedSitemap);
    } catch (error) {
      res.status(500).send('Error generating compressed sitemap');
    }
  }

  @Get('robots.txt')
  @Public()
  @Header('Content-Type', 'text/plain')
  async getRobotsTxt(@Res() res: Response) {
    const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /cart/
Disallow: /checkout/
Disallow: /profile/
Disallow: /dashboard/

# Allow important pages
Allow: /products/
Allow: /categories/
Allow: /about/
Allow: /contact/

# Sitemap location
Sitemap: ${process.env.BASE_URL || 'https://yourdomain.com'}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Specific rules for search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;

    res.send(robotsTxt);
  }
}
