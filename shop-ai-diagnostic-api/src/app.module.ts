import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './modules/auth/auth.module'
import { ShopModule } from './modules/shop/shop.module'
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module'
import { ProductModule } from './modules/product/product.module'
import { TaskModule } from './modules/task/task.module'
import { AlertModule } from './modules/alert/alert.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { ConfigService as MyConfigService } from './config/config.service'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => MyConfigService.loadConfig()],
    }),

    // MongoDB连接
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),

    // 限流配置
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 定时任务
    ScheduleModule.forRoot(),

    // 业务模块
    AuthModule,
    ShopModule,
    DiagnosticModule,
    ProductModule,
    TaskModule,
    AlertModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
