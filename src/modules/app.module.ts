import { Module } from '@nestjs/common';

// npm install --save @nestjs/typeorm typeorm mysql2
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';

// 环境配置相关
// npm i --save @nestjs/config
import { ConfigModule } from '@nestjs/config';

// import { UserModule } from './user.module';
import { RedisModule } from './redis.module';
import { AuthModule } from './auth.module';
import { EntitiesModule } from './entities.module';

import { AppController } from '@/controllers/app.controller';
import { RoleController } from '@/controllers/role.controller';
import { UserController } from '@/controllers/user.controller';
import { PermissionController } from '@/controllers/permission.controller';
import { CaptchaController } from '@/controllers/captcha.controller';
import { UploadController } from '@/controllers/upload.controller';
import { MeetingRoomController } from '@/controllers/meeting-room.controller';
import { BookingController } from '@/controllers/booking.controller';
import { StatisticsController } from '@/controllers/statistics.controller';

import { RoleService } from '@/services/role.service';
import { UserService } from '@/services/user.service';
import { PermissionService } from '@/services/permission.service';
import { CaptchaService } from '@/services/captcha.service';
import { UploadService } from '@/services/upload.service';
import { MeetingRoomService } from '@/services/meeting-room.service';
import { BookingService } from '@/services/booking.service';
import { StatisticsService } from '@/services/statistics.service';
import { EncryptService } from '@/services/encrypt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT, // 来自process.env的每个值都是字符串，前面加+转数字
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true, // 自动加载模块 推荐
        // entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')], // 不推荐
        synchronize: true, // 开启同步，生产中要禁止
        // logging: true, // 开启日志
        timezone: 'Asia/Shanghai' // 设置时区
      })
    }),
    // UserModule,
    RedisModule,
    AuthModule,
    EntitiesModule
  ],
  controllers: [
    AppController,
    RoleController,
    UserController,
    PermissionController,
    CaptchaController,
    UploadController,
    MeetingRoomController,
    BookingController,
    StatisticsController
  ],
  providers: [
    RoleService,
    UserService,
    PermissionService,
    CaptchaService,
    UploadService,
    MeetingRoomService,
    BookingService,
    StatisticsService,
    EncryptService
  ]
})
export class AppModule {}
