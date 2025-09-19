import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseKeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseKeepAliveService.name);
  private pingInterval: NodeJS.Timeout;
  private isConnected = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Ping database mỗi 5 phút để duy trì kết nối
    const pingIntervalMs = this.configService.get('DB_PING_INTERVAL_MS', 5 * 60 * 1000); // 5 phút
    
    this.logger.log(`Starting database keep-alive service with ${pingIntervalMs}ms interval`);
    
    // Ping ngay lập tức
    await this.pingDatabase();
    
    // Thiết lập ping định kỳ
    this.pingInterval = setInterval(async () => {
      await this.pingDatabase();
    }, pingIntervalMs);
  }

  async onModuleDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.logger.log('Database keep-alive service stopped');
    }
  }

  private async pingDatabase(): Promise<void> {
    try {
      // Thực hiện một query đơn giản để duy trì kết nối
      await this.prisma.$queryRaw`SELECT 1 as ping`;
      
      if (!this.isConnected) {
        this.logger.log('Database connection established and maintained');
        this.isConnected = true;
      }
    } catch (error) {
      this.logger.error('Failed to ping database:', error.message);
      this.isConnected = false;
      
      // Thử kết nối lại
      try {
        await this.prisma.$connect();
        this.logger.log('Database reconnected successfully');
        this.isConnected = true;
      } catch (reconnectError) {
        this.logger.error('Failed to reconnect to database:', reconnectError.message);
      }
    }
  }

  /**
   * Kiểm tra trạng thái kết nối database
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ping manual database
   */
  async manualPing(): Promise<{ success: boolean; message: string }> {
    try {
      await this.pingDatabase();
      return {
        success: true,
        message: 'Database ping successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}
