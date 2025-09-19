import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            // Cấu hình connection pool để duy trì kết nối tốt hơn
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            // Log các query để debug
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Connected to the database successfully');
            
            // Test connection
            await this.$queryRaw`SELECT 1`;
            this.logger.log('✅ Database connection test passed');
        } catch (error) {
            this.logger.error('❌ Failed to connect to database:', error.message);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('✅ Disconnected from database');
        } catch (error) {
            this.logger.error('❌ Error disconnecting from database:', error.message);
        }
    }

    /**
     * Health check cho database
     */
    async isHealthy(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}