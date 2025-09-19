import { Controller, Get } from '@nestjs/common';
import { DatabaseKeepAliveService } from './database-keepalive.service';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseKeepAlive: DatabaseKeepAliveService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  async healthCheck() {
    const dbConnected = await this.prisma.isHealthy();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        status: dbConnected ? 'healthy' : 'unhealthy'
      },
      uptime: process.uptime(),
    };
  }

  @Get('db')
  @Public()
  async databaseHealth() {
    const isConnected = await this.databaseKeepAlive.checkConnection();
    
    return {
      database: {
        connected: isConnected,
        status: isConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString()
      }
    };
  }

  @Get('ping')
  @Public()
  async pingDatabase() {
    const result = await this.databaseKeepAlive.manualPing();
    
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  }
}
