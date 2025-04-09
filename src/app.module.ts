import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from "cache-manager-ioredis"

@Module({
  imports: [PrismaModule, AuthModule, CategoryModule, ProductModule, OrderModule, 
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000,
      host: '172.17.0.2',
      port: 6379,
      store: redisStore
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
