import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../../decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @Public()
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get('top')
  @Public()
  getTop(@Query('limit') limit?: number) {
    return this.categoriesService.getTopCategories(limit ? parseInt(limit.toString()) : 6);
  }

  @Get('featured')
  @Public()
  getFeatured() {
    return this.categoriesService.getFeaturedCategories();
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
