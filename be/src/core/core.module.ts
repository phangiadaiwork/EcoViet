import { Module } from '@nestjs/common';
import { DatabaseKeepAliveService } from './database-keepalive.service';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [DatabaseKeepAliveService],
  exports: [DatabaseKeepAliveService],
})
export class CoreModule {}
