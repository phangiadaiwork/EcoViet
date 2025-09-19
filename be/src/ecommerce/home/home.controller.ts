import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { Public } from '../../decorators/public.decorator';

@Controller('home')
@Public()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('data')
  async getHomeData() {
    return this.homeService.getHomePageData();
  }

  @Get('featured-products')
  async getFeaturedProducts(@Query('limit') limit?: number) {
    return this.homeService.getFeaturedProducts(limit ? parseInt(limit.toString()) : 4);
  }

  @Get('featured-categories')
  async getFeaturedCategories(@Query('limit') limit?: number) {
    return this.homeService.getFeaturedCategories(limit ? parseInt(limit.toString()) : 4);
  }
}
